import type { Faro, FetchTransport } from '@grafana/faro-web-sdk';

import { FARO_ALLOWED_ORIGINS, faroCollectorUrl } from '~/common/faroConfig';
import { sanitizeFaroAttributes, type FaroEventAttributes } from './events';
import { sanitizeFaroItem, type FaroEvent } from './privacy';

let instance: Faro | undefined;
let transport: FetchTransport | undefined;
let controller: AbortController | undefined;
let loading = false;
let sessionId = '';
let started = false;

function browserPrivacyRequested(): boolean {
    return (
        navigator.doNotTrack === '1' ||
        (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
    );
}

function observabilityConfigured(): boolean {
    return (
        Boolean(faroCollectorUrl(process.env.NEXT_PUBLIC_FARO_URL)) &&
        FARO_ALLOWED_ORIGINS.some((origin) => origin === window.location.origin) &&
        process.env.NODE_ENV === 'production'
    );
}

function maySend(): boolean {
    return observabilityConfigured() && !browserPrivacyRequested();
}

/** Recheck browser privacy after asynchronous SDK loading and before every transport item. */
export async function syncObservability(): Promise<void> {
    if (!maySend()) {
        instance?.pause();
        controller?.abort();
        controller = undefined;
        return;
    }
    if (loading || controller) {
        return;
    }
    loading = true;
    try {
        const sdk = await import('@grafana/faro-web-sdk');
        if (!maySend()) {
            return;
        }
        const url = faroCollectorUrl(process.env.NEXT_PUBLIC_FARO_URL);
        if (!url) {
            return;
        }
        const version = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';
        sessionId = crypto.randomUUID();
        controller = new AbortController();
        const nextTransport = new sdk.FetchTransport({
            url,
            requestOptions: {
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
                signal: controller.signal,
            },
        });
        if (instance) {
            if (transport) {
                instance.transports.remove(transport);
            }
            instance.transports.add(nextTransport);
            instance.unpause();
        } else {
            instance = sdk.initializeFaro({
                app: { name: 'rusys-web', environment: 'production', version },
                instrumentations: [new sdk.ErrorsInstrumentation(), new sdk.WebVitalsInstrumentation()],
                metas: [],
                transports: [nextTransport],
                batching: { enabled: false },
                isolate: true,
                preventGlobalExposure: true,
                trackGeolocation: false,
                beforeSend: (item) => (maySend() ? sanitizeFaroItem(item, version, sessionId, sdk.VERSION) : null),
            });
        }
        transport = nextTransport;
        trackFaroEvent('telemetry_enabled');
    } catch {
        // Observability must never prevent the application from starting or an action from completing.
        instance?.pause();
        controller?.abort();
        controller = undefined;
    } finally {
        loading = false;
    }
}

export function trackFaroEvent<Name extends FaroEvent>(name: Name, attributes?: FaroEventAttributes<Name>): void {
    try {
        if (maySend()) {
            instance?.api.pushEvent(name, sanitizeFaroAttributes(name, attributes), undefined, { skipDedupe: true });
        }
    } catch {
        // A telemetry failure must not change application behavior.
    }
}

export function startObservability(): void {
    if (!started) {
        started = true;
        window.addEventListener('focus', () => void syncObservability());
        document.addEventListener('visibilitychange', () => void syncObservability());
    }
    void syncObservability();
}
