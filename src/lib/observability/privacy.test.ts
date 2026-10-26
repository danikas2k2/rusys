import { TransportItemType, type TransportItem } from '@grafana/faro-web-sdk';

import { FARO_EVENT_ATTRIBUTES } from './events';
import { sanitizeFaroItem } from './privacy';

function item(type: TransportItemType, payload: unknown): TransportItem {
    return {
        type,
        payload,
        meta: {
            user: { email: 'private@example.test', id: 'account-id' },
            page: { url: 'https://rusys.andriaus.com/private?token=secret' },
            browser: { name: 'private-browser' },
        },
    } as TransportItem;
}

function sanitize(value: TransportItem): TransportItem | null {
    return sanitizeFaroItem(value, '4.2.10', 'ephemeral-id', '2.13.0');
}

describe('faro privacy allowlist', () => {
    it('retains only bounded vital names and finite nonnegative values', () => {
        const result = sanitize(
            item(TransportItemType.MEASUREMENT, {
                type: 'web-vitals',
                values: { cls: 0, lcp: 123, inp: -1, fcp: Number.NaN, ttfb: Infinity, private: 42, fid: 90_000_000 },
                context: { element: '#private-product', resource_url: '/images/private-name' },
            })
        );

        expect(result?.payload).toStrictEqual({
            type: 'web-vitals',
            values: { cls: 0, lcp: 123 },
            timestamp: expect.any(String),
        });
        expect(result?.meta).toStrictEqual({
            app: { name: 'rusys-web', environment: 'production', version: '4.2.10' },
            sdk: { name: '@grafana/faro-web-sdk', version: '2.13.0' },
            session: { id: 'ephemeral-id' },
        });
    });

    it('redacts errors, causes, stack paths, functions and user context', () => {
        const result = sanitize(
            item(TransportItemType.EXCEPTION, {
                type: 'TypeError',
                value: 'private@example.test secret product',
                stacktrace: { frames: [{ filename: '/private-product', function: 'private-name' }] },
                context: { token: 'secret' },
                trace: { trace_id: 'identity' },
                originalError: new Error('secret'),
            })
        );

        expect(result?.payload).toStrictEqual({
            type: 'TypeError',
            value: 'Browser error (details redacted)',
            timestamp: expect.any(String),
        });
        expect(JSON.stringify(result)).not.toMatch(/private|secret|identity/);
    });

    it('normalizes custom exception types that may contain personal data', () => {
        const result = sanitize(
            item(TransportItemType.EXCEPTION, { type: 'Account private@example.test', value: 'secret' })
        );

        expect(result?.payload).toMatchObject({ type: 'Error' });
    });

    it('allows named custom actions while dropping all attributes', () => {
        const result = sanitize(
            item(TransportItemType.EVENT, { name: 'item_created', attributes: { name: 'private' }, domain: 'private' })
        );

        expect(result?.payload).toStrictEqual({ name: 'item_created', timestamp: expect.any(String) });
    });

    it.each(Object.entries(FARO_EVENT_ATTRIBUTES))('allows only the static attribute enums for %s', (name, schema) => {
        const attributes = Object.fromEntries(Object.entries(schema).map(([key, values]) => [key, values[0]]));
        const result = sanitize(
            item(TransportItemType.EVENT, {
                name,
                attributes: {
                    ...attributes,
                    title: 'private inventory name',
                    id: 'private-id',
                    count: 5,
                    url: '/private',
                },
                domain: 'private-domain',
            })
        );

        expect(result?.payload).toStrictEqual({
            name,
            timestamp: expect.any(String),
            ...(Object.keys(attributes).length ? { attributes } : {}),
        });
        expect(JSON.stringify(result)).not.toContain('private');
    });

    it.each([
        { form: 'private@example.test', field: 'secret inventory name', result: 'success' },
        { form: 123, field: { toString: () => 'name' } },
        { form: ['product'], field: true },
        ['product', 'name'],
        'private@example.test',
        null,
    ])('drops invalid and cross-event attributes %s', (attributes) => {
        const result = sanitize(item(TransportItemType.EVENT, { name: 'form_field_changed', attributes }));

        expect(result?.payload).toStrictEqual({ name: 'form_field_changed', timestamp: expect.any(String) });
    });

    it('does not accept inherited attributes or object prototype event names', () => {
        const attributes: unknown = Object.create({ form: 'product', field: 'name' });

        expect(
            sanitize(item(TransportItemType.EVENT, { name: 'form_field_changed', attributes }))?.payload
        ).toStrictEqual({ name: 'form_field_changed', timestamp: expect.any(String) });
        expect(sanitize(item(TransportItemType.EVENT, { name: 'toString' }))).toBeNull();
        expect(sanitize(item(TransportItemType.EVENT, { name: '__proto__' }))).toBeNull();
    });

    it.each([
        item(TransportItemType.EVENT, { name: 'click', attributes: { text: 'private' } }),
        item(TransportItemType.LOG, { message: 'private' }),
        item(TransportItemType.TRACE, { resourceSpans: [] }),
        item(TransportItemType.MEASUREMENT, { type: 'resource', values: { lcp: 1 } }),
        item(TransportItemType.MEASUREMENT, { type: 'web-vitals', values: { unknown: 1 } }),
    ])('drops signals outside the allowlist %s', (value) => {
        expect(sanitize(value)).toBeNull();
    });
});
