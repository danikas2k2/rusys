import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { installConsoleLogging, logEvent } = await import('~/server/logging');
        installConsoleLogging();
        logEvent('server_started');
    }
}

export const onRequestError: Instrumentation.onRequestError = async (_error, request, context) => {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { logEvent } = await import('~/server/logging');
        logEvent('request_failed', { method: request.method, routeType: context.routeType }, 'error');
    }
};
