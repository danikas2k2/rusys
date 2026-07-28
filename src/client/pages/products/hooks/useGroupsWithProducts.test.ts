import { renderHook } from '@testing-library/react';

import { useProducts } from '~/client/state/products/useProducts';
import { useGroupsWithProducts } from './useGroupsWithProducts';

vi.mock(import('~/client/state/products/useProducts'));

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
});
