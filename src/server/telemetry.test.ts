import { createServer } from 'node:http';

import { describe, expect, it } from 'vitest';

import { createTraceState, SpanStatusCode, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { PrivateSpanExporter, tracingResource } from './telemetry';
import { withSpan } from './tracing';

describe('backend tracing', () => {
    it.each(['blue', 'green'])(
        'labels %s with release and environment while rejecting arbitrary resource values',
        (slot) => {
            expect(tracingResource({ APP_SLOT: slot, APP_VERSION: '4.2.10', NODE_ENV: 'production' })).toStrictEqual({
                'service.name': 'rusys-web',
                'service.version': '4.2.10',
                'deployment.environment.name': 'production',
                'deployment.slot': slot,
            });
            expect(
                tracingResource({ APP_SLOT: 'personal', APP_VERSION: 'private@example.com', NODE_ENV: 'private' })
            ).toStrictEqual({
                'service.name': 'rusys-web',
                'service.version': 'unknown',
                'deployment.environment.name': 'unknown',
                'deployment.slot': 'unknown',
            });
        }
    );

    it('exports nested operations over HTTP/protobuf without request, exception, scope, resource or tracestate data', async () => {
        const payloads: Buffer[] = [];
        const server = createServer((request, response) => {
            expect(request.url).toBe('/v1/traces');
            expect(request.headers['content-type']).toBe('application/x-protobuf');

            const chunks: Buffer[] = [];
            request.on('data', (chunk: Buffer) => chunks.push(chunk));
            request.on('end', () => {
                payloads.push(Buffer.concat(chunks));
                response.end();
            });
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Missing test server address');
        }
        const memory = new InMemorySpanExporter();
        const resource = tracingResource({ APP_SLOT: 'green', APP_VERSION: '4.2.10', NODE_ENV: 'production' });
        const provider = new NodeTracerProvider({
            resource: resourceFromAttributes({ 'private.resource': 'SENSITIVE' }),
            spanProcessors: [
                new SimpleSpanProcessor(new PrivateSpanExporter(memory, resource)),
                new SimpleSpanProcessor(
                    new PrivateSpanExporter(
                        new OTLPTraceExporter({
                            url: `http://127.0.0.1:${address.port}/v1/traces`,
                            timeoutMillis: 1000,
                        }),
                        resource
                    )
                ),
            ],
        });
        provider.register();
        try {
            await provider.getTracer('SENSITIVE').startActiveSpan('GET /SENSITIVE?secret=SENSITIVE', async (span) => {
                span.setAttributes({
                    'http.route': '/api/v1/groups/[group]',
                    'http.target': '/SENSITIVE',
                    'http.method': 'GET',
                    'http.status_code': 200,
                    'next.span_type': 'BaseServer.handleRequest',
                    'db.statement': 'SENSITIVE',
                    'http.request.header.cookie': 'SENSITIVE',
                });
                span.spanContext().traceState = createTraceState('user=SENSITIVE');
                span.addEvent('SENSITIVE', { value: 'SENSITIVE' });
                span.recordException(new Error('SENSITIVE'));
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'SENSITIVE' });
                await withSpan('products.read', () =>
                    withSpan('db.products.aggregate', async () => {
                        await new Promise((resolve) => setTimeout(resolve, 10));
                    })
                );

                await expect(
                    withSpan('image.classify', async () => {
                        throw new Error('SENSITIVE');
                    })
                ).rejects.toThrow('SENSITIVE');

                span.end();
            });
            await provider.forceFlush();
            const spans = memory.getFinishedSpans();
            const root = spans.find((span) => span.name === 'BaseServer.handleRequest')!;
            const read = spans.find((span) => span.name === 'products.read')!;
            const query = spans.find((span) => span.name === 'db.products.aggregate')!;

            expect({
                count: spans.length,
                readParent: read.parentSpanContext?.spanId,
                queryParent: query.parentSpanContext?.spanId,
                queryTrace: query.spanContext().traceId,
                status: root.status,
                events: root.events,
                traceState: read.parentSpanContext?.traceState,
                failure: spans.find((span) => span.name === 'image.classify')?.status.code,
            }).toStrictEqual({
                count: 4,
                readParent: root.spanContext().spanId,
                queryParent: read.spanContext().spanId,
                queryTrace: root.spanContext().traceId,
                status: { code: SpanStatusCode.ERROR },
                events: [],
                traceState: undefined,
                failure: SpanStatusCode.ERROR,
            });
            expect(query.duration[1]).toBeGreaterThanOrEqual(1_000_000);
            expect(root.attributes).toStrictEqual({
                'http.route': '/api/v1/groups/[group]',
                'http.request.method': 'GET',
                'http.response.status_code': 200,
                'next.span_type': 'BaseServer.handleRequest',
            });

            const wire = Buffer.concat(payloads).toString('utf8');

            expect([wire.includes('rusys-web'), wire.includes('green'), wire.includes('4.2.10')]).toStrictEqual([
                true,
                true,
                true,
            ]);
            expect(wire).not.toContain('SENSITIVE');
        } finally {
            await provider.shutdown();
            trace.disable();
            await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
        }
    });
});
