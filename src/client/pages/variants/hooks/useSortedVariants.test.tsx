import { renderHook } from '@testing-library/react';

import React from 'react';

import { useVariants } from '~/client/state/variants/useVariants';
import { useSortedVariants } from './useSortedVariants';

jest.mock('~/client/state/variants/useVariants');

describe('useSortedVariants', () => {
    const mockVariants = [
        { variant: 'p', group: 'Group1', order: 2 },
        { variant: 'd', group: 'Group1', order: 1 },
        { variant: 'm', group: 'Group2', order: 1 },
        { variant: 'n', group: 'Group2', order: 2 },
    ];

    beforeEach(() => jest.mocked(useVariants).mockReturnValue(mockVariants));

    afterEach(() => jest.clearAllMocks());

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
        jest.mocked(useVariants).mockReturnValue([
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
