import { SpanStatusCode, trace } from '@opentelemetry/api';

export const operationNames = [
    'products.read',
    'products.variants',
    'image.save',
    'image.classify',
    'image.thumbnail',
    'db.products.aggregate',
    'db.groups.find',
] as const;

/** Static operation names only; never attach arguments, results or exceptions. */
export async function withSpan<T>(name: (typeof operationNames)[number], run: () => Promise<T>): Promise<T> {
    return trace.getTracer('rusys.operations').startActiveSpan(name, async (span) => {
        try {
            return await run();
        } catch (error) {
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw error;
        } finally {
            span.end();
        }
    });
}
