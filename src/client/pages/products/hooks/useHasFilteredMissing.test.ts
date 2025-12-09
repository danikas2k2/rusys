import { renderHook } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useHasFilteredMissing } from '~/client/pages/products/hooks/useHasFilteredMissing';
import { useProducts } from '~/client/state/products/useProducts';

jest.mock('~/client/filters/hooks/useGroupFilterPredicate', () => ({
    useGroupFilterPredicate: jest.fn(),
}));

jest.mock('~/client/filters/hooks/useQuickFilterPredicate', () => ({
    useQuickFilterPredicate: jest.fn(),
}));

jest.mock('~/client/state/products/useProducts', () => ({
    useProducts: jest.fn(),
}));

describe('useHasFilteredMissing', () => {
    const products = getProductsFixture();

    beforeEach(() => {
        jest.mocked(useProducts).mockReturnValue(products);
        jest.mocked(useGroupFilterPredicate).mockReturnValue(() => true);
        jest.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns true when a missing product passes both filters', () => {
        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(true);
    });

    it('returns false when group filter hides missing products', () => {
        jest.mocked(useGroupFilterPredicate).mockReturnValue((group: string) => group !== 'Uogienės');

        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(false);
    });

    it('returns false when quick filter hides missing products', () => {
        jest.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => !name.includes('Braškės'));

        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(false);
    });

    it('returns false when there are no missing products', () => {
        jest.mocked(useProducts).mockReturnValue(products.map((p) => ({ ...p, missing: false })));

        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(false);
    });
});
