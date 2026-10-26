import { FetchTransport, initializeFaro, VERSION, WebVitalsInstrumentation, type Faro } from '@grafana/faro-web-sdk';

import type * as faroConfig from '~/common/faroConfig';
import { sanitizeFaroItem } from './privacy';

vi.mock(import('~/common/faroConfig'), async (importOriginal) => ({
    ...(await importOriginal<typeof faroConfig>()),
    FARO_ALLOWED_ORIGINS: [window.location.origin],
}));

interface CollectorBody {
    meta: {
        app: { name: string; version: string; environment: string };
        sdk: { name: string; version: string };
        session: { id: string };
    };
    events?: { name: string; attributes?: Record<string, string> }[];
    exceptions?: { type: string; value: string }[];
    measurements?: { type: string; values: Record<string, number> }[];
}

describe('real Faro SDK transport pipeline', () => {
    const fetchMock = vi.fn<typeof fetch>();
    let originalOnerror: OnErrorEventHandler;
    let measurementInstance: Faro | undefined;
    let controller: AbortController | undefined;

    function bodies(): CollectorBody[] {
        return fetchMock.mock.calls.map(([, options]) => JSON.parse(options?.body as string) as CollectorBody);
    }

    beforeEach(() => {
        vi.resetModules();
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(new Response(null, { status: 202 }));
        vi.stubGlobal('fetch', fetchMock);
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', 'https://faro-collector-test.grafana.net/collect/test-key');
        vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '4.2.10');
        localStorage.clear();
        Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '0' });
        Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, value: false });
        originalOnerror = window.onerror;
    });

    afterEach(async () => {
        const faro = await import('./faro');
        Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '1' });
        await faro.syncObservability();
        measurementInstance?.pause();
        controller?.abort();
        measurementInstance = undefined;
        controller = undefined;
        window.onerror = originalOnerror;
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('delivers repeated actions and browser errors through the actual application initializer', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();

        faro.trackFaroEvent('export_started');
        faro.trackFaroEvent('export_started');
        // Invoke the browser callback installed by the real ErrorsInstrumentation.
        window.onerror?.(
            'private@example.test inventory-name',
            'https://rusys.andriaus.com/private-product?token=secret',
            17,
            3,
            new TypeError('private@example.test inventory-name')
        );
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
        const delivered = bodies();

        expect(delivered.flatMap((body) => body.events ?? []).map((event) => event.name)).toStrictEqual([
            'telemetry_enabled',
            'export_started',
            'export_started',
        ]);
        expect(delivered.flatMap((body) => body.exceptions ?? [])).toStrictEqual([
            { type: 'TypeError', value: 'Browser error (details redacted)', timestamp: expect.any(String) },
        ]);
        expect(JSON.stringify(delivered)).not.toMatch(/private|inventory-name|secret|token|stacktrace/);
        expect(delivered[0]?.meta).toStrictEqual({
            app: { name: 'rusys-web', environment: 'production', version: '4.2.10' },
            sdk: { name: '@grafana/faro-web-sdk', version: VERSION },
            session: { id: expect.any(String) },
        });

        for (const [index, [, options]] of fetchMock.mock.calls.entries()) {
            expect(options).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
            expect(options?.headers).toMatchObject({ 'x-faro-session-id': delivered[index]?.meta.session.id });
        }
    });

    it('sends the Web Vitals measurement API through the actual SDK with attribution removed', async () => {
        const sessionId = crypto.randomUUID();
        controller = new AbortController();
        measurementInstance = initializeFaro({
            app: { name: 'rusys-web', environment: 'production', version: '4.2.10' },
            instrumentations: [new WebVitalsInstrumentation()],
            metas: [],
            transports: [
                new FetchTransport({
                    url: 'https://faro-collector-test.grafana.net/collect/test-key',
                    requestOptions: { credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal },
                }),
            ],
            batching: { enabled: false },
            isolate: true,
            preventGlobalExposure: true,
            beforeSend: (item) => sanitizeFaroItem(item, '4.2.10', sessionId, VERSION),
        });
        measurementInstance.api.pushMeasurement({
            type: 'web-vitals',
            values: { lcp: 1200, cls: 0, private_metric: 123 },
            context: { element: '#private-inventory-name', resource_url: '/private-image?token=secret' },
        });
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        expect(bodies()[0]?.measurements).toStrictEqual([
            { type: 'web-vitals', values: { lcp: 1200, cls: 0 }, timestamp: expect.any(String) },
        ]);
        expect(JSON.stringify(bodies())).not.toMatch(/private|token|context/);
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            headers: { 'x-faro-session-id': sessionId },
        });
    });

    it('delivers bounded usage categories, strips runtime content, and stops actions after a browser privacy request', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        const attributes = {
            form: 'product' as const,
            field: 'name' as const,
            content: 'private@example.test',
            id: 'secret',
        };
        faro.trackFaroEvent('form_field_changed', attributes);
        faro.trackFaroEvent('form_field_changed', attributes);
        faro.trackFaroEvent('data_action', { entity: 'product', action: 'update', result: 'success' });
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        expect(
            bodies()
                .flatMap((body) => body.events ?? [])
                .slice(1)
        ).toStrictEqual([
            {
                name: 'form_field_changed',
                attributes: { form: 'product', field: 'name' },
                timestamp: expect.any(String),
            },
            {
                name: 'form_field_changed',
                attributes: { form: 'product', field: 'name' },
                timestamp: expect.any(String),
            },
            {
                name: 'data_action',
                attributes: { entity: 'product', action: 'update', result: 'success' },
                timestamp: expect.any(String),
            },
        ]);
        expect(JSON.stringify(bodies())).not.toMatch(/private|secret|content/);

        Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '1' });
        await faro.syncObservability();
        faro.trackFaroEvent('dialog_opened', { dialog: 'product' });

        expect(fetchMock).toHaveBeenCalledTimes(4);
    });
});
