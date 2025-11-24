import { renderHook } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';

import { useMissingProducts } from '~/client/pages/products/hooks/useMissingProducts';

describe('useMissingProducts', () => {
    it('returns nothing for empty list', () => {
        const { result } = renderHook(() => useMissingProducts([]));

        expect(result.current).toStrictEqual([]);
    });

    const products = getProductsFixture();

    it('returns nothing if no missing items in the list', () => {
        const { result } = renderHook(() => useMissingProducts(products.slice(2)));

        expect(result.current).toStrictEqual([]);
    });

    it('returns missing items', () => {
        const { result } = renderHook(() => useMissingProducts(products));

        expect(result.current).toStrictEqual([products[1]]);
    });
});
