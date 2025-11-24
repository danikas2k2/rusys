import { renderHook } from '@testing-library/react';

import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/state/variants/useVariants');
jest.mock('~/client/state/products/useProducts');

describe('useProductsHasData', () => {
    it('returns true if has all required products data', () => {
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBeTrue();
    });

    it('returns false if has no years', () => {
        jest.mocked(useYears).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no groups', () => {
        jest.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        jest.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no products', () => {
        jest.mocked(useProducts).mockReturnValueOnce([]);
        const { result } = renderHook(() => useProductsHasData());

        expect(result.current).toBeFalse();
    });
});
