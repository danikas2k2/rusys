import { renderHook } from '@testing-library/react';

import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useProducts } from '~/client/state/products/useProducts';
import { useGroupsWithProducts } from './useGroupsWithProducts';

vi.mock(import('~/client/state/products/useProducts'));

vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(() => () => true),
}));

vi.mock(import('~/client/pages/products/MissingOnlyContext'), () => ({
    useMissingOnly: vi.fn(() => [false, vi.fn()]),
}));

describe('useGroupsWithProducts', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns the set of groups that have at least one product', () => {
        vi.mocked(useProducts).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės' },
            { group: 'Uogienės', name: 'Braškės' },
            { group: 'Daržovės', name: 'Agurkai' },
        ]);

        const { result } = renderHook(() => useGroupsWithProducts());

        expect(result.current).toStrictEqual(new Set(['Uogienės', 'Daržovės']));
    });

    it('returns an empty set when there are no products', () => {
        vi.mocked(useProducts).mockReturnValue([]);

        const { result } = renderHook(() => useGroupsWithProducts());

        expect(result.current).toStrictEqual(new Set());
    });

    it('excludes groups whose products are all hidden by the quick filter', () => {
        vi.mocked(useProducts).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės' },
            { group: 'Daržovės', name: 'Agurkai' },
        ]);
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Agurkai');

        const { result } = renderHook(() => useGroupsWithProducts());

        expect(result.current).toStrictEqual(new Set(['Daržovės']));
    });

    it('excludes groups with no missing product when showing missing only', () => {
        vi.mocked(useProducts).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', missing: false },
            { group: 'Daržovės', name: 'Agurkai', missing: true },
        ]);
        vi.mocked(useMissingOnly).mockReturnValue([true, vi.fn()]);

        const { result } = renderHook(() => useGroupsWithProducts());

        expect(result.current).toStrictEqual(new Set(['Daržovės']));
    });
});
