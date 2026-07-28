import { renderHook } from '@testing-library/react';

import { useProducts } from '~/client/state/products/useProducts';
import { useGroupsWithReviewProducts } from './useGroupsWithReviewProducts';

vi.mock(import('~/client/state/products/useProducts'));

describe('useGroupsWithReviewProducts', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns groups that have at least one product with recorded stock', () => {
        vi.mocked(useProducts).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', years: [{ year: 23, amounts: [] }] },
            { group: 'Uogienės', name: 'Braškės', years: [] },
            { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [] }] },
        ]);

        const { result } = renderHook(() => useGroupsWithReviewProducts());

        expect(result.current).toStrictEqual(new Set(['Uogienės', 'Daržovės']));
    });

    it('excludes groups whose products have no recorded years', () => {
        vi.mocked(useProducts).mockReturnValue([{ group: 'Uogienės', name: 'Avietės', years: [] }]);

        const { result } = renderHook(() => useGroupsWithReviewProducts());

        expect(result.current).toStrictEqual(new Set());
    });

    it('returns an empty set when there are no products', () => {
        vi.mocked(useProducts).mockReturnValue([]);

        const { result } = renderHook(() => useGroupsWithReviewProducts());

        expect(result.current).toStrictEqual(new Set());
    });
});
