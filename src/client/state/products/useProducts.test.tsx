import { renderHook } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useProducts } from '~/client/state/products/useProducts';
import type { Product } from '~/types/data';

describe('useProducts', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useProducts(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const products: Product[] = getProductsFixture();
        const { result } = renderHook(() => useProducts(), {
            wrapper: ({ children }) => <MockRedux state={{ products }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(products);
    });
});
