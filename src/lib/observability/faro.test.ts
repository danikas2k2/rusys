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

describe('default Faro lifecycle', () => {
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

    it.each(['denied', 'granted'])('ignores legacy stored preference %s', async (preference) => {
        localStorage.setItem('rusys-observability-consent-v1', preference);
        const faro = await import('./faro');
        await faro.syncObservability();

        expect(mocks.initialize).toHaveBeenCalledTimes(1);
    });

    it('initializes without reading or writing browser storage', async () => {
        const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const faro = await import('./faro');
        await faro.syncObservability();

        expect(mocks.initialize).toHaveBeenCalledTimes(1);
        expect(read).not.toHaveBeenCalled();
        expect(write).not.toHaveBeenCalled();

        read.mockRestore();
        write.mockRestore();
    });

    it('initializes only errors/vitals and omits credentials and referrers', async () => {
        const faro = await import('./faro');
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

    it('aborts pending requests, drops items and rotates session when an origin is revoked', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        const config = mocks.initialize.mock.calls[0]?.[0] as BrowserConfig;
        const sample = { type: 'event', meta: {}, payload: { name: 'export_started' } } as TransportItem;
        const first = config.beforeSend?.(sample);
        const signal = mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal;
        mocks.allowedOrigins.splice(0);
        await faro.syncObservability();

        expect(signal.aborted).toBe(true);
        expect(config.beforeSend?.(sample)).toBeNull();
        expect(mocks.pause).toHaveBeenCalledWith();

        mocks.allowedOrigins.push(window.location.origin);
        await faro.syncObservability();
        await vi.waitFor(() => expect(mocks.unpause).toHaveBeenCalledExactlyOnceWith());

        expect(config.beforeSend?.(sample)?.meta.session?.id).not.toBe(first?.meta.session?.id);
    });

    it.each(['doNotTrack', 'globalPrivacyControl'])(
        'initializes and delivers actions with browser privacy signal %s',
        async (signal) => {
            const faro = await import('./faro');
            Object.defineProperty(navigator, signal, {
                configurable: true,
                value: signal === 'doNotTrack' ? '1' : true,
            });
            await faro.syncObservability();

            faro.trackFaroEvent('export_started');

            expect(mocks.initialize).toHaveBeenCalledTimes(1);
            expect(mocks.pushEvent).toHaveBeenCalledWith('export_started', undefined, undefined, { skipDedupe: true });
        }
    );

    it('keeps the active transport and sanitized items when both browser privacy signals are enabled', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        const config = mocks.initialize.mock.calls[0]?.[0] as BrowserConfig;
        const signal = mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal;
        Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '1' });
        Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, value: true });
        await faro.syncObservability();
        faro.trackFaroEvent('export_started');

        expect(signal.aborted).toBe(false);
        expect(mocks.pause).not.toHaveBeenCalled();
        expect(mocks.transport).toHaveBeenCalledTimes(1);
        expect(
            config.beforeSend?.({ type: 'event', meta: {}, payload: { name: 'export_started' } } as TransportItem)
        ).toMatchObject({ payload: { name: 'export_started' } });
        expect(mocks.pushEvent).toHaveBeenCalledWith('export_started', undefined, undefined, { skipDedupe: true });
    });

    it('fails closed for malformed collector configuration', async () => {
        const faro = await import('./faro');
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', 'https://unrelated.example/collect/key');
        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('does not collect on unapproved origins', async () => {
        mocks.allowedOrigins.splice(0, mocks.allowedOrigins.length, 'https://unapproved.example');
        const faro = await import('./faro');
        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('does not collect in development builds', async () => {
        const faro = await import('./faro');
        vi.stubEnv('NODE_ENV', 'development');
        await faro.syncObservability();

        expect(mocks.initialize).not.toHaveBeenCalled();
    });

    it('continues initialization when both browser privacy signals change while the SDK loads', async () => {
        const faro = await import('./faro');
        const pending = faro.syncObservability();
        Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '1' });
        Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, value: true });
        await pending;
        faro.trackFaroEvent('export_started');

        expect(mocks.initialize).toHaveBeenCalledTimes(1);
        expect(mocks.pushEvent).toHaveBeenCalledWith('export_started', undefined, undefined, { skipDedupe: true });
    });

    it('cancels initialization when configuration becomes invalid during SDK loading', async () => {
        const faro = await import('./faro');
        const pending = faro.syncObservability();
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', '');
        await pending;

        expect(mocks.initialize).not.toHaveBeenCalled();

        vi.stubEnv('NEXT_PUBLIC_FARO_URL', 'https://faro-collector-test.grafana.net/collect/test-key');
        await faro.syncObservability();

        expect(mocks.initialize).toHaveBeenCalledTimes(1);
    });

    it('aborts an active transport when collector configuration becomes invalid', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', '');
        await faro.syncObservability();

        expect(mocks.pause).toHaveBeenCalledExactlyOnceWith();
        expect((mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal).aborted).toBe(true);
    });

    it('initializes once for concurrent and repeated requests', async () => {
        const faro = await import('./faro');
        await Promise.all([faro.syncObservability(), faro.syncObservability()]);
        await faro.syncObservability();

        expect(mocks.initialize).toHaveBeenCalledTimes(1);
    });

    it('registers configuration rechecks once and aborts or resumes on focus and visibility changes', async () => {
        const faro = await import('./faro');
        const windowListener = vi.spyOn(window, 'addEventListener');
        const documentListener = vi.spyOn(document, 'addEventListener');
        faro.startObservability();
        faro.startObservability();
        await vi.waitFor(() => expect(mocks.initialize).toHaveBeenCalledTimes(1));

        expect(windowListener.mock.calls.filter(([name]) => name === 'focus')).toHaveLength(1);
        expect(documentListener.mock.calls.filter(([name]) => name === 'visibilitychange')).toHaveLength(1);

        vi.stubEnv('NEXT_PUBLIC_FARO_URL', '');
        window.dispatchEvent(new Event('focus'));

        expect((mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal).aborted).toBe(true);

        vi.stubEnv('NEXT_PUBLIC_FARO_URL', 'https://faro-collector-test.grafana.net/collect/test-key');
        document.dispatchEvent(new Event('visibilitychange'));
        await vi.waitFor(() => expect(mocks.unpause).toHaveBeenCalledTimes(1));
        for (const [name, listener] of windowListener.mock.calls) {
            window.removeEventListener(name, listener);
        }
        for (const [name, listener] of documentListener.mock.calls) {
            document.removeEventListener(name, listener);
        }
        windowListener.mockRestore();
        documentListener.mockRestore();
    });

    it('uses an unknown build version when no version was embedded', async () => {
        vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '');
        const faro = await import('./faro');
        await faro.syncObservability();

        expect(mocks.initialize.mock.calls[0]?.[0].app.version).toBe('unknown');
    });

    it('contains event API failures', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        mocks.pushEvent.mockImplementationOnce(() => {
            throw new Error('SDK failure');
        });

        expect(() => faro.trackFaroEvent('export_started')).not.toThrow();
    });

    it('drops custom events as soon as collector configuration becomes invalid', async () => {
        const faro = await import('./faro');
        await faro.syncObservability();
        mocks.pushEvent.mockClear();
        vi.stubEnv('NEXT_PUBLIC_FARO_URL', '');
        faro.trackFaroEvent('export_started');

        expect(mocks.pushEvent).not.toHaveBeenCalled();
    });

    it('contains SDK initialization failure', async () => {
        const faro = await import('./faro');
        mocks.initialize.mockImplementationOnce(() => {
            throw new Error('SDK unavailable');
        });

        await expect(faro.syncObservability()).resolves.toBeUndefined();
        expect((mocks.transport.mock.calls[0]?.[0].requestOptions.signal as AbortSignal).aborted).toBe(true);

        await faro.syncObservability();

        expect(mocks.initialize).toHaveBeenCalledTimes(2);
    });
});
