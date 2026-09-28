import { renderHook } from '@testing-library/react';

import { useVariants } from '~/store/variants/useVariants';
import { useSortedVariants } from './useSortedVariants';

vi.mock(import('~/store/variants/useVariants'));

describe('useSortedVariants', () => {
    const mockVariants = [
        { variant: 'p', group: 'Group1', order: 2 },
        { variant: 'd', group: 'Group1', order: 1 },
        { variant: 'm', group: 'Group2', order: 1 },
        { variant: 'n', group: 'Group2', order: 2 },
    ];

    beforeEach(() => {
        vi.mocked(useVariants).mockReturnValue(mockVariants);
    });

    afterEach(() => vi.clearAllMocks());

    it('returns all variants sorted by order', () => {
        const { result } = renderHook(() => useSortedVariants());

        expect(result.current).toStrictEqual([
            { variant: 'd', group: 'Group1', order: 1 },
            { variant: 'm', group: 'Group2', order: 1 },
            { variant: 'p', group: 'Group1', order: 2 },
            { variant: 'n', group: 'Group2', order: 2 },
        ]);
    });

    it('sorts variants by order', () => {
        vi.mocked(useVariants).mockReturnValue([
            { variant: 'z', group: 'Group1', order: 3 },
            { variant: 'a', group: 'Group1', order: 1 },
            { variant: 'b', group: 'Group1', order: 2 },
        ]);

        const { result } = renderHook(() => useSortedVariants());

        expect(result.current).toStrictEqual([
            { variant: 'a', group: 'Group1', order: 1 },
            { variant: 'b', group: 'Group1', order: 2 },
            { variant: 'z', group: 'Group1', order: 3 },
        ]);
    });
});
