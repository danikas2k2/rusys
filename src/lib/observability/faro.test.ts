import type { BrowserConfig, TransportItem } from '@grafana/faro-web-sdk';

import type * as faroConfig from '~/common/faroConfig';

const mocks = vi.hoisted(() => ({
    allowedOrigins: [] as string[],
    initialize: vi.fn(),
    pushEvent: vi.fn(),
    pause: vi.fn(),
    unpause: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    transport: vi.fn(),
}));

vi.mock(import('@grafana/faro-web-sdk'), () => ({
    VERSION: '2.13.0',
    initializeFaro: mocks.initialize,
    FetchTransport: class {
        constructor(options: unknown) {
            mocks.transport(options);
        }
    },
    ErrorsInstrumentation: class {},
    WebVitalsInstrumentation: class {},
}));

vi.mock(import('~/common/faroConfig'), async (importOriginal) => ({
    ...(await importOriginal<typeof faroConfig>()),
    FARO_ALLOWED_ORIGINS: mocks.allowedOrigins,
}));

describe('consent-gated Faro lifecycle', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        mocks.allowedOrigins.splice(0, mocks.allowedOrigins.length, window.location.origin);
        localStorage.clear();
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', 'https://faro-collector-test.grafana.net/collect/test-key');
        vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '4.2.10');
        Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '0' });
        Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, value: false });
        mocks.initialize.mockReturnValue({
            api: { pushEvent: mocks.pushEvent },
            pause: mocks.pause,
            unpause: mocks.unpause,
            transports: { add: mocks.add, remove: mocks.remove },
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('does not initialize or emit without explicit consent', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        faro.trackFaroEvent('export_started');

        expect(mocks.initialize).not.toHaveBeenCalled();
        expect(mocks.pushEvent).not.toHaveBeenCalled();
    });

    it('initializes only errors/vitals and omits credentials and referrers', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        await faro.syncObservability();
        const config = mocks.initialize.mock.calls[0]?.[0] as BrowserConfig;

        expect(config).toMatchObject({
            app: { version: '4.2.10' },
            metas: [],
            batching: { enabled: false },
            isolate: true,
            preventGlobalExposure: true,
            trackGeolocation: false,
        });
        expect(config.instrumentations).toHaveLength(2);
        expect(mocks.transport).toHaveBeenCalledWith(
            expect.objectContaining({
                requestOptions: { credentials: 'omit', referrerPolicy: 'no-referrer', signal: expect.any(AbortSignal) },
            })
        );
        expect(mocks.pushEvent).toHaveBeenCalledWith('telemetry_enabled', undefined, undefined, { skipDedupe: true });
    });

    it('aborts pending requests, drops signals and rotates session after revocation', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        await faro.syncObservability();
        const config = mocks.initialize.mock.calls[0]?.[0] as BrowserConfig;
        const sample = { type: 'event', meta: {}, payload: { name: 'export_started' } } as TransportItem;
        const first = config.beforeSend?.(sample);
        const signal = mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal;
        faro.setObservabilityConsent(false);

        expect(signal.aborted).toBe(true);
        expect(config.beforeSend?.(sample)).toBeNull();
        expect(mocks.pause).toHaveBeenCalledWith();

        faro.setObservabilityConsent(true);
        await vi.waitFor(() => expect(mocks.unpause).toHaveBeenCalledExactlyOnceWith());

        expect(config.beforeSend?.(sample)?.meta.session?.id).not.toBe(first?.meta.session?.id);
    });

    it.each(['doNotTrack', 'globalPrivacyControl'])('honors browser privacy signal %s', async (signal) => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        Object.defineProperty(navigator, signal, { configurable: true, value: signal === 'doNotTrack' ? '1' : true });
        await faro.syncObservability();

        expect(faro.observabilityConsented()).toBe(false);
        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('fails closed for malformed collector configuration', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', 'https://unrelated.example/collect/key');
        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('does not collect on unapproved origins', async () => {
        mocks.allowedOrigins.splice(0, mocks.allowedOrigins.length, 'https://unapproved.example');
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('does not collect in development builds', async () => {
        const faro = await import('./faro');
        vi.stubEnv('NODE_ENV', 'development');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('rechecks consent if it is revoked while the SDK loads', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        const pending = faro.syncObservability();
        localStorage.setItem('rusys-observability-consent-v1', 'denied');
        await pending;

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('initializes once for concurrent and repeated requests', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        await Promise.all([faro.syncObservability(), faro.syncObservability()]);
        await faro.syncObservability();

        expect(mocks.initialize).toHaveBeenCalledTimes(1);
    });

    it('revokes collection after another tab changes stored consent', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        await faro.syncObservability();
        const unsubscribe = faro.subscribeObservability(() => void faro.syncObservability());
        localStorage.setItem('rusys-observability-consent-v1', 'denied');
        window.dispatchEvent(new StorageEvent('storage', { key: 'rusys-observability-consent-v1' }));

        expect(mocks.pause).toHaveBeenCalledExactlyOnceWith();
        expect((mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal).aborted).toBe(true);

        unsubscribe();
    });

    it('fails closed when storage is unavailable', async () => {
        const faro = await import('./faro');
        const read = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const write = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });

        expect(faro.observabilityConsented()).toBe(false);
        expect(faro.setObservabilityConsent(true)).toBe(false);

        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();

        read.mockRestore();
        write.mockRestore();
    });

    it('contains SDK initialization failure', async () => {
        const faro = await import('./faro');
        localStorage.setItem('rusys-observability-consent-v1', 'granted');
        mocks.initialize.mockImplementationOnce(() => {
            throw new Error('SDK unavailable');
        });

        await expect(faro.syncObservability()).resolves.toBeUndefined();
        expect((mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal).aborted).toBe(true);
    });
});
