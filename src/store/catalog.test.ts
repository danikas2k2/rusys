import { QueryClient } from '@tanstack/react-query';

import { CATALOG_KEYS, setCatalogData } from './catalog';

describe('setCatalogData', () => {
    it('seeds every collection, including empty collections', () => {
        const client = new QueryClient();
        setCatalogData(client, { groups: [], variants: [], years: [], products: [], summary: [] });
        for (const key of Object.values(CATALOG_KEYS)) {
            expect(client.getQueryData(key)).toStrictEqual([]);
        }
    });

    it('preserves only matching product and summary histories on refresh', () => {
        const client = new QueryClient();
        const history = { updates: [], undates: [] };
        setCatalogData(client, {
            products: [{ group: 'A', name: 'Rice', years: [], history: { 26: history } }],
            summary: [{ group: 'A', name: 'Rice', years: [], history: { 26: history } }],
        });
        setCatalogData(client, {
            products: [
                { group: 'A', name: 'Rice', years: [] },
                { group: 'B', name: 'Rice', years: [] },
            ],
            summary: [
                { group: 'A', name: 'Rice', years: [] },
                { group: 'B', name: 'Rice', years: [] },
            ],
        });

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'A', name: 'Rice', years: [], history: { 26: history } },
            { group: 'B', name: 'Rice', years: [] },
        ]);
        expect(client.getQueryData(CATALOG_KEYS.summary)).toStrictEqual([
            { group: 'A', name: 'Rice', years: [], history: { 26: history } },
            { group: 'B', name: 'Rice', years: [] },
        ]);
    });

    it('does not erase collections omitted by a route payload', () => {
        const client = new QueryClient();
        const groups = [{ group: 'A', order: 0 }];
        setCatalogData(client, { groups });
        setCatalogData(client, { products: [] });

        expect(client.getQueryData(CATALOG_KEYS.groups)).toStrictEqual(groups);
    });
});
