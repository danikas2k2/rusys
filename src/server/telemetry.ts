import { SpanStatusCode, type Attributes, type SpanContext } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
    BatchSpanProcessor,
    TraceIdRatioBasedSampler,
    type ReadableSpan,
    type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { operationNames } from './tracing';

const routes = [
    '/',
    '/[...path]',
    '/offline',
    '/api/health',
    '/images/[...path]',
    '/sw.js',
    '/api/v1/offline/identity',
    '/api/v1/imports',
    '/api/v1/groups/[group]',
    '/api/v1/groups/[group]/products/[name]/image',
    '/api/v1/groups/[group]/products/[name]/variants/[variant]/image',
];
const spanTypes = [
    'BaseServer.handleRequest',
    'AppRender.getBodyResult',
    'AppRouteRouteHandlers.runHandler',
    'NextNodeServer.findPageComponents',
    'NextNodeServer.startResponse',
    'NextNodeServer.getLayoutOrPageModule',
    'ResolveMetadata.generateMetadata',
    'AppRender.fetch',
];

function privateContext(context: SpanContext): SpanContext {
    return { traceId: context.traceId, spanId: context.spanId, traceFlags: context.traceFlags };
}

export function tracingResource(env: NodeJS.ProcessEnv): Attributes {
    return {
        'service.name': 'rusys-web',
        'service.version': /^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(env.APP_VERSION ?? '') ? env.APP_VERSION! : 'unknown',
        'deployment.environment.name': ['production', 'development', 'test'].includes(env.NODE_ENV ?? '')
            ? env.NODE_ENV!
            : 'unknown',
        'deployment.slot': ['blue', 'green'].includes(env.APP_SLOT ?? '') ? env.APP_SLOT! : 'unknown',
    };
}

/** Final export boundary also covers automatic Next.js spans and dependency spans. */
export class PrivateSpanExporter implements SpanExporter {
    constructor(
        private readonly delegate: SpanExporter,
        private readonly resource: Attributes
    ) {}

    export(spans: ReadableSpan[], callback: Parameters<SpanExporter['export']>[1]): void {
        this.delegate.export(
            spans.map((span): ReadableSpan => {
                const attributes: Attributes = {};
                const route = span.attributes['http.route'] ?? span.attributes['next.route'];
                if (typeof route === 'string' && routes.includes(route)) {
                    attributes['http.route'] = route;
                }
                const method = span.attributes['http.method'] ?? span.attributes['http.request.method'];
                if (
                    typeof method === 'string' &&
                    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)
                ) {
                    attributes['http.request.method'] = method;
                }
                const status = span.attributes['http.status_code'] ?? span.attributes['http.response.status_code'];
                if (typeof status === 'number' && Number.isInteger(status) && status >= 100 && status <= 599) {
                    attributes['http.response.status_code'] = status;
                }
                const spanType = span.attributes['next.span_type'];
                if (typeof spanType === 'string' && spanTypes.includes(spanType)) {
                    attributes['next.span_type'] = spanType;
                }
                const name = operationNames.includes(span.name as (typeof operationNames)[number])
                    ? span.name
                    : typeof spanType === 'string' && spanTypes.includes(spanType)
                      ? spanType
                      : 'backend.operation';
                // Construct explicitly: spreading an SDK span can preserve future sensitive fields.
                return {
                    name,
                    kind: span.kind,
                    spanContext: () => privateContext(span.spanContext()),
                    parentSpanContext: span.parentSpanContext ? privateContext(span.parentSpanContext) : undefined,
                    startTime: span.startTime,
                    endTime: span.endTime,
                    duration: span.duration,
                    status: {
                        code: span.status.code === SpanStatusCode.ERROR ? SpanStatusCode.ERROR : SpanStatusCode.UNSET,
                    },
                    attributes,
                    events: [],
                    links: [],
                    resource: resourceFromAttributes(this.resource),
                    instrumentationScope: { name: 'rusys.backend' },
                    droppedAttributesCount: 0,
                    droppedEventsCount: 0,
                    droppedLinksCount: 0,
                    ended: span.ended,
                };
            }),
            callback
        );
    }

    shutdown(): Promise<void> {
        return this.delegate.shutdown();
    }
    forceFlush(): Promise<void> {
        return this.delegate.forceFlush?.() ?? Promise.resolve();
    }
}

let provider: NodeTracerProvider | undefined;

export function registerTracing(): void {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    if (provider || !endpoint) {
        return;
    }
    const resource = tracingResource(process.env);
    provider = new NodeTracerProvider({
        resource: resourceFromAttributes(resource),
        // Ignore remote sampled flags. The ratio is nominal, not an ingress rate limit:
        // caller-supplied trace IDs can influence sampling; queues remain bounded.
        sampler: new TraceIdRatioBasedSampler(0.1),
        spanProcessors: [
            new BatchSpanProcessor(
                new PrivateSpanExporter(
                    new OTLPTraceExporter({
                        url: endpoint,
                        timeoutMillis: 3000,
                        concurrencyLimit: 1,
                    }),
                    resource
                ),
                {
                    maxQueueSize: 512,
                    maxExportBatchSize: 64,
                    scheduledDelayMillis: 5000,
                    exportTimeoutMillis: 4000,
                }
            ),
        ],
    });
    provider.register();
    // Next.js owns signal handling. Flush before exit without intercepting SIGTERM or keeping Node alive.
    process.once('beforeExit', () => {
        void provider?.shutdown().catch(() => undefined);
    });
}
