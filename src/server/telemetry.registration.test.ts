import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
    exporter: vi.fn(),
    processor: vi.fn(),
    provider: vi.fn(),
    sampler: vi.fn(),
    register: vi.fn(),
    shutdown: vi.fn<() => Promise<void>>(),
}));

vi.mock(import('@opentelemetry/exporter-trace-otlp-proto'), () => ({
    OTLPTraceExporter: class {
        constructor(config: unknown) {
            sdk.exporter(config);
        }
    },
}));
vi.mock(import('@opentelemetry/sdk-trace-base'), () => ({
    BatchSpanProcessor: class {
        constructor(...args: unknown[]) {
            sdk.processor(...args);
        }
    },
    TraceIdRatioBasedSampler: class {
        constructor(ratio: number) {
            sdk.sampler(ratio);
        }
    },
}));
vi.mock(import('@opentelemetry/sdk-trace-node'), () => ({
    NodeTracerProvider: class {
        constructor(config: unknown) {
            sdk.provider(config);
        }
        register = sdk.register;
        shutdown = sdk.shutdown;
    },
}));

describe('tracing registration', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        sdk.shutdown.mockResolvedValue(undefined);
        vi.stubEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT', 'http://collector.internal:4318/v1/traces');
        vi.stubEnv('APP_SLOT', 'green');
        vi.stubEnv('APP_VERSION', '4.2.10');
        vi.stubEnv('NODE_ENV', 'production');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('stays disabled without an endpoint and can be enabled later', async () => {
        vi.stubEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT', '');
        const { registerTracing } = await import('./telemetry');
        const once = vi.spyOn(process, 'once');

        registerTracing();

        expect(sdk.provider).not.toHaveBeenCalled();
        expect(sdk.exporter).not.toHaveBeenCalled();
        expect(once).not.toHaveBeenCalled();

        vi.stubEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT', 'http://collector.internal:4318/v1/traces');
        // Capture the exit hook without adding a real process listener.
        once.mockReturnValue(process);
        registerTracing();

        expect(sdk.register).toHaveBeenCalledExactlyOnceWith();
    });

    it('registers once with explicit transport, resource, sampling and queue limits', async () => {
        const { PrivateSpanExporter, registerTracing } = await import('./telemetry');
        const once = vi.spyOn(process, 'once').mockReturnValue(process);

        registerTracing();
        registerTracing();

        expect(sdk.provider).toHaveBeenCalledExactlyOnceWith({
            resource: expect.objectContaining({
                attributes: {
                    'service.name': 'rusys-web',
                    'service.version': '4.2.10',
                    'deployment.environment.name': 'production',
                    'deployment.slot': 'green',
                },
            }),
            sampler: expect.any(Object),
            spanProcessors: [expect.any(Object)],
        });
        expect(sdk.register).toHaveBeenCalledExactlyOnceWith();
        expect(sdk.exporter).toHaveBeenCalledExactlyOnceWith({
            url: 'http://collector.internal:4318/v1/traces',
            timeoutMillis: 3000,
            concurrencyLimit: 1,
        });
        expect(sdk.sampler).toHaveBeenCalledExactlyOnceWith(0.1);
        expect(sdk.processor).toHaveBeenCalledExactlyOnceWith(expect.any(PrivateSpanExporter), {
            maxQueueSize: 512,
            maxExportBatchSize: 64,
            scheduledDelayMillis: 5000,
            exportTimeoutMillis: 4000,
        });
        expect(once).toHaveBeenCalledExactlyOnceWith('beforeExit', expect.any(Function));
    });

    it.each([
        { outcome: 'success', shutdown: () => Promise.resolve() },
        { outcome: 'failure', shutdown: () => Promise.reject(new Error('collector unavailable')) },
    ])('handles beforeExit shutdown $outcome', async ({ shutdown }) => {
        const { registerTracing } = await import('./telemetry');
        const once = vi.spyOn(process, 'once').mockReturnValue(process);
        sdk.shutdown.mockImplementation(shutdown);

        registerTracing();
        const listener = once.mock.calls.find(([event]) => event === 'beforeExit')?.[1];

        expect(listener).toBeTypeOf('function');
        expect(listener?.(0)).toBeUndefined();

        // Allow the rejection handler to run; Vitest also reports any unhandled rejection.
        await Promise.resolve();

        expect(sdk.shutdown).toHaveBeenCalledExactlyOnceWith();
    });
});
