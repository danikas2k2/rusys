import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { getProductsAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/products'));

describe('useGetProducts', () => {
    it('refreshes products and dependent collections while preserving loaded history', async () => {
        const products = [{ group: 'Food', name: 'Rice', years: [] }];
        const history = { updates: [], undates: [] };
        const { client, wrapper } = mockQuery({ products: [{ ...products[0], history: { 26: history } }] });
        const years = [26];
        const groups = [{ group: 'Food', order: 0 }];
        const variants = [{ group: 'Food', variant: 'Box', order: 0 }];
        vi.mocked(getProductsAction).mockResolvedValue({ products, years, groups, variants });
        const { result } = renderHook(useGetProducts, { wrapper });
        await result.current();

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { ...products[0], history: { 26: history } },
        ]);
        expect(client.getQueryData(CATALOG_KEYS.years)).toStrictEqual(years);
        expect(client.getQueryData(CATALOG_KEYS.groups)).toStrictEqual(groups);
        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(variants);
    });
});
