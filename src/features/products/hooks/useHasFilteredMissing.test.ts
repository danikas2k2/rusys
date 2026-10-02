import { renderHook } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';

import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useHasFilteredMissing } from '~/features/products/hooks/useHasFilteredMissing';
import { useProducts } from '~/store/products';

vi.mock(import('~/features/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));

vi.mock(import('~/store/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('useHasFilteredMissing', () => {
    const products = getProductsFixture();

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue(products);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => vi.clearAllMocks());

    it('returns true when a missing product passes the filter', () => {
        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(true);
    });

    it('returns true when a missing product exists in a category other than the selected one', () => {
        vi.mocked(useProducts).mockReturnValue([
            ...products,
            { group: 'Kita kategorija', name: 'Kažkas', missing: true },
        ]);

        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(true);
    });

    it('returns false when quick filter hides missing products', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => !name.includes('Braškės'));

        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(false);
    });

    it('returns false when there are no missing products', () => {
        vi.mocked(useProducts).mockReturnValue(products.map((p) => ({ ...p, missing: false })));

        const { result } = renderHook(() => useHasFilteredMissing());

        expect(result.current).toBe(false);
    });
});
