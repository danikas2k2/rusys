import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { installConsoleLogging, logEvent } = await import('~/server/logging');
        installConsoleLogging();
        const { registerTracing } = await import('~/server/telemetry');
        registerTracing();
        const { default: path } = await import('node:path');
        const { IMAGES_DIR } = await import('~/server/data/images');
        const { startStagedImageCleanup } = await import('~/server/stagedImageCleanupScheduler');
        startStagedImageCleanup(path.join(IMAGES_DIR, '.pending'), () => {
            logEvent('runtime_output_redacted', {}, 'error');
        });
        logEvent('server_started');
    }
}

export const onRequestError: Instrumentation.onRequestError = async (_error, request, context) => {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { logEvent } = await import('~/server/logging');
        logEvent('request_failed', { method: request.method, routeType: context.routeType }, 'error');
    }
};
