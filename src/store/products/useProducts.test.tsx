import { renderHook, waitFor } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import type { Product } from '~/schema';
import { getProductsAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';
import { useProducts } from './useProducts';

vi.mock(import('~/server/actions/products'));

describe('useProducts', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useProducts(), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const products: Product[] = getProductsFixture();
        const { result } = renderHook(() => useProducts(), {
            wrapper: ({ children }) => <MockData state={{ products }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(products);
    });
});

describe('useProducts query', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads products when the registered query is explicitly fetched', async () => {
        const products = [{ group: 'Food', name: 'Rice', years: [] }];
        vi.mocked(getProductsAction).mockResolvedValue({ products, years: [], groups: [], variants: [] });
        const { client, wrapper } = mockQuery();
        const { result } = renderHook(useProducts, { wrapper });

        expect(getProductsAction).not.toHaveBeenCalled();

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.products })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual(products));

        expect(getProductsAction).toHaveBeenCalledExactlyOnceWith();
    });
});
