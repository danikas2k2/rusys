import { renderHook } from '@testing-library/react';

import { useProductsHasData } from '~/features/products/hooks/useProductsHasData';
import { useGroups } from '~/store/groups';
import { useProducts } from '~/store/products';
import { useVariants } from '~/store/variants';
import { useYears } from '~/store/years';

vi.mock(import('~/store/years/useYears'));
vi.mock(import('~/store/groups/useGroups'));
vi.mock(import('~/store/variants/useVariants'));
vi.mock(import('~/store/products/useProducts'));

describe('useProductsHasData', () => {
    it('returns true if has all required products data', () => {
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBe(true);
    });

    it('returns false if has no years', () => {
        vi.mocked(useYears).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no groups', () => {
        vi.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no variants', () => {
        vi.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no products', () => {
        vi.mocked(useProducts).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBe(false);
    });
});
