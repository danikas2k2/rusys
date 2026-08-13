import { renderHook } from '@testing-library/react';

import { useVariants } from '~/client/state/variants/useVariants';
import { useGroupsWithVariants } from './useGroupsWithVariants';

vi.mock(import('~/client/state/variants/useVariants'));

describe('useGroupsWithVariants', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns the set of groups that have at least one variant', () => {
        vi.mocked(useVariants).mockReturnValue([
            { variant: 'p', group: 'Uogienės', order: 0 },
            { variant: 'd', group: 'Uogienės', order: 1 },
            { variant: 'x', group: 'Daržovės', order: 0 },
        ]);

        const { result } = renderHook(() => useGroupsWithVariants());

        expect(result.current).toStrictEqual(new Set(['Uogienės', 'Daržovės']));
    });

    it('returns an empty set when there are no variants', () => {
        vi.mocked(useVariants).mockReturnValue([]);

        const { result } = renderHook(() => useGroupsWithVariants());

        expect(result.current).toStrictEqual(new Set());
    });

    it('only includes groups with variants matching the filter', () => {
        vi.mocked(useVariants).mockReturnValue([
            { variant: 'p', group: 'Uogienės', order: 0 },
            { variant: 'x', group: 'Daržovės', order: 0 },
        ]);

        const { result } = renderHook(() => useGroupsWithVariants((variant) => variant === 'x'));

        expect(result.current).toStrictEqual(new Set(['Daržovės']));
    });
});
