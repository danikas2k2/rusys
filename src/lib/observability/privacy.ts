import type { TransportItem } from '@grafana/faro-web-sdk';

import { FARO_EVENTS, sanitizeFaroAttributes, type FaroEvent } from './events';

export { FARO_EVENTS, type FaroEvent } from './events';

const errorTypes = new Set([
    'Error',
    'TypeError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'URIError',
    'EvalError',
]);
const vitalNames = new Set(['cls', 'fcp', 'fid', 'inp', 'lcp', 'ttfb']);

/** Reconstruct every field: SDK additions and arbitrary user context fail closed. */
export function sanitizeFaroItem(
    item: TransportItem,
    version: string,
    sessionId: string,
    sdkVersion: string
): TransportItem | null {
    const meta = {
        app: { name: 'rusys-web', environment: 'production', version },
        sdk: { name: '@grafana/faro-web-sdk', version: sdkVersion },
        session: { id: sessionId },
    };
    const timestamp = new Date().toISOString();
    if (item.type === 'event' && 'name' in item.payload) {
        const name = item.payload.name;
        if (!FARO_EVENTS.some((allowed) => allowed === name)) {
            return null;
        }
        const attributes = sanitizeFaroAttributes(name as FaroEvent, item.payload.attributes);
        return { type: item.type, meta, payload: { name, timestamp, ...(attributes ? { attributes } : {}) } };
    }
    if (item.type === 'exception' && 'value' in item.payload) {
        const type = errorTypes.has(item.payload.type) ? item.payload.type : 'Error';
        // Error messages, function names, stack URLs and context can contain inventory or identity data.
        return { type: item.type, meta, payload: { type, value: 'Browser error (details redacted)', timestamp } };
    }
    if (item.type === 'measurement' && 'values' in item.payload && item.payload.type === 'web-vitals') {
        const values = Object.fromEntries(
            Object.entries(item.payload.values).filter(
                ([name, value]) => vitalNames.has(name) && Number.isFinite(value) && value >= 0 && value <= 86_400_000
            )
        );
        if (!Object.keys(values).length) {
            return null;
        }
        return { type: item.type, meta, payload: { type: 'web-vitals', values, timestamp } };
    }
    return null;
}
