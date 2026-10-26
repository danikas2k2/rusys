import { describe, expect, it, vi } from 'vitest';

import { createTraceState, SpanKind, SpanStatusCode, TraceFlags, type Attributes } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { InMemorySpanExporter, type ReadableSpan, type SpanExporter } from '@opentelemetry/sdk-trace-base';

import { PrivateSpanExporter, tracingResource } from './telemetry';
import { operationNames } from './tracing';

const resource = tracingResource({ APP_SLOT: 'blue', APP_VERSION: '4.2.10', NODE_ENV: 'production' });

function sourceSpan(attributes: Attributes = {}, name = 'GET /private@example.com'): ReadableSpan {
    return {
        name,
        kind: SpanKind.SERVER,
        spanContext: () => ({
            traceId: '12345678901234567890123456789012',
            spanId: '1234567890123456',
            traceFlags: TraceFlags.SAMPLED,
            traceState: createTraceState('user=private'),
            isRemote: true,
        }),
        parentSpanContext: {
            traceId: '12345678901234567890123456789012',
            spanId: '6543210987654321',
            traceFlags: TraceFlags.SAMPLED,
            traceState: createTraceState('user=private'),
            isRemote: true,
        },
        startTime: [1, 0],
        endTime: [2, 0],
        duration: [1, 0],
        status: { code: SpanStatusCode.OK, message: 'private' },
        attributes,
        events: [{ name: 'private', time: [1, 0], attributes: { secret: 'private' } }],
        links: [{ context: { traceId: 'private', spanId: 'private', traceFlags: TraceFlags.NONE } }],
        resource: resourceFromAttributes({ secret: 'private' }),
        instrumentationScope: { name: 'private', version: 'private', schemaUrl: 'private' },
        droppedAttributesCount: 1,
        droppedEventsCount: 2,
        droppedLinksCount: 3,
        ended: true,
    };
}

function sanitize(span: ReadableSpan): ReadableSpan {
    const memory = new InMemorySpanExporter();
    new PrivateSpanExporter(memory, resource).export([span], () => undefined);
    return memory.getFinishedSpans()[0]!;
}

describe('trace export privacy boundary', () => {
    it('keeps diagnostic identity and timings while replacing all sensitive metadata', () => {
        const source = sourceSpan({ 'db.statement': 'private', 'http.url': 'private', 'user.id': 'private' });
        const exported = sanitize(source);

        expect(exported).toStrictEqual({
            name: 'backend.operation',
            kind: source.kind,
            spanContext: expect.any(Function),
            parentSpanContext: {
                traceId: source.parentSpanContext!.traceId,
                spanId: source.parentSpanContext!.spanId,
                traceFlags: TraceFlags.SAMPLED,
            },
            startTime: source.startTime,
            endTime: source.endTime,
            duration: source.duration,
            status: { code: SpanStatusCode.UNSET },
            attributes: {},
            events: [],
            links: [],
            resource: resourceFromAttributes(resource),
            instrumentationScope: { name: 'rusys.backend' },
            droppedAttributesCount: 0,
            droppedEventsCount: 0,
            droppedLinksCount: 0,
            ended: true,
        });
        expect(exported.spanContext()).toStrictEqual({
            traceId: source.spanContext().traceId,
            spanId: source.spanContext().spanId,
            traceFlags: TraceFlags.SAMPLED,
        });
        expect(source.events).toHaveLength(1);
        expect(source.spanContext().traceState?.serialize()).toBe('user=private');
    });

    it.each(operationNames)('preserves the static operation name %s ahead of a framework type', (name) => {
        expect(sanitize(sourceSpan({ 'next.span_type': 'AppRender.fetch' }, name)).name).toBe(name);
    });

    it.each(['AppRender.fetch', 'AppRouteRouteHandlers.runHandler', 'BaseServer.handleRequest'])(
        'uses the known framework type %s instead of a dynamic name',
        (type) => {
            const exported = sanitize(sourceSpan({ 'next.span_type': type }));

            expect(exported.name).toBe(type);
            expect(exported.attributes).toStrictEqual({ 'next.span_type': type });
        }
    );

    it('accepts supported route/method/status aliases without retaining original attribute names', () => {
        expect(
            sanitize(
                sourceSpan({
                    'next.route': '/api/health',
                    'http.request.method': 'HEAD',
                    'http.response.status_code': 204,
                })
            ).attributes
        ).toStrictEqual({
            'http.route': '/api/health',
            'http.request.method': 'HEAD',
            'http.response.status_code': 204,
        });
    });

    it('gives primary attributes precedence over aliases, including invalid primary values', () => {
        expect(
            sanitize(
                sourceSpan({
                    'http.route': '/private',
                    'next.route': '/api/health',
                    'http.method': 'private',
                    'http.request.method': 'GET',
                    'http.status_code': 42,
                    'http.response.status_code': 200,
                })
            ).attributes
        ).toStrictEqual({});
    });

    it.each([
        { 'http.route': 123, 'http.method': 123, 'http.status_code': '200', 'next.span_type': 123 },
        { 'http.route': '/private', 'http.method': 'get', 'http.status_code': 99, 'next.span_type': 'private' },
        {
            'http.route': ['/api/health'],
            'http.method': ['GET'],
            'http.status_code': 600,
            'next.span_type': ['AppRender.fetch'],
        },
        { 'http.status_code': 200.5 },
        { 'http.status_code': Number.NaN },
        { 'http.status_code': Number.POSITIVE_INFINITY },
    ])('rejects unknown, malformed and out-of-range attributes: %j', (attributes) => {
        const exported = sanitize(sourceSpan(attributes));

        expect(exported.attributes).toStrictEqual({});
        expect(exported.name).toBe('backend.operation');
    });

    it.each([100, 599])('preserves valid status boundary %i', (status) => {
        expect(sanitize(sourceSpan({ 'http.status_code': status })).attributes).toStrictEqual({
            'http.response.status_code': status,
        });
    });

    it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])('preserves method %s', (method) => {
        expect(sanitize(sourceSpan({ 'http.method': method })).attributes).toStrictEqual({
            'http.request.method': method,
        });
    });

    it('keeps an error code without its message and preserves spans with no parent', () => {
        const source = sourceSpan();
        const exported = sanitize({
            ...source,
            parentSpanContext: undefined,
            status: { code: SpanStatusCode.ERROR, message: 'private' },
        });

        expect(exported.status).toStrictEqual({ code: SpanStatusCode.ERROR });
        expect(exported.parentSpanContext).toBeUndefined();
    });

    it('forwards delegate completion, shutdown and flush, including export failures', async () => {
        const failure = { code: 1, error: new Error('collector unavailable') };
        const callback = vi.fn<Parameters<SpanExporter['export']>[1]>();
        const delegate: SpanExporter = {
            export: vi.fn((_spans, done) => done(failure)),
            shutdown: vi.fn().mockResolvedValue(undefined),
            forceFlush: vi.fn().mockResolvedValue(undefined),
        };
        const exporter = new PrivateSpanExporter(delegate, resource);
        exporter.export([], callback);

        expect(delegate.export).toHaveBeenCalledWith([], callback);
        expect(callback).toHaveBeenCalledExactlyOnceWith(failure);
        await expect(exporter.forceFlush()).resolves.toBeUndefined();
        await expect(exporter.shutdown()).resolves.toBeUndefined();
        expect(delegate.forceFlush).toHaveBeenCalledExactlyOnceWith();
        expect(delegate.shutdown).toHaveBeenCalledExactlyOnceWith();
    });

    it('supports exporters without forceFlush and propagates lifecycle failures', async () => {
        const failure = new Error('collector unavailable');
        const delegate: SpanExporter = { export: vi.fn(), shutdown: vi.fn().mockRejectedValue(failure) };
        const exporter = new PrivateSpanExporter(delegate, resource);

        await expect(exporter.forceFlush()).resolves.toBeUndefined();
        await expect(exporter.shutdown()).rejects.toBe(failure);

        const flushDelegate: SpanExporter = {
            export: vi.fn(),
            shutdown: vi.fn().mockResolvedValue(undefined),
            forceFlush: vi.fn().mockRejectedValue(failure),
        };

        await expect(new PrivateSpanExporter(flushDelegate, resource).forceFlush()).rejects.toBe(failure);
    });
});

describe('tracing resource validation', () => {
    it('uses bounded unknown labels when resource variables are missing', () => {
        expect(tracingResource({})).toStrictEqual({
            'service.name': 'rusys-web',
            'service.version': 'unknown',
            'deployment.environment.name': 'unknown',
            'deployment.slot': 'unknown',
        });
    });

    it.each(['0.0.0', '999999.999999.999999'])('accepts a bounded release %s', (version) => {
        expect(tracingResource({ APP_VERSION: version })['service.version']).toBe(version);
    });

    it.each(['1000000.1.1', '1.1.1000000', '1.2', '1.2.3-private', 'v1.2.3', '1.2.3\n', ''])(
        'rejects release %j',
        (version) => {
            expect(tracingResource({ APP_VERSION: version })['service.version']).toBe('unknown');
        }
    );

    it.each(['development', 'test'])('accepts environment %s', (environment) => {
        expect(tracingResource({ NODE_ENV: environment })['deployment.environment.name']).toBe(environment);
    });
});
