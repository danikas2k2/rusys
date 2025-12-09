import { renderHook } from '@testing-library/react';

import React from 'react';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
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

    it('returns all variants when no filters are set', () => {
        const { result } = renderHook(() => useSortedVariants(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toStrictEqual([
            { variant: 'd', group: 'Group1', order: 1 },
            { variant: 'm', group: 'Group2', order: 1 },
            { variant: 'p', group: 'Group1', order: 2 },
            { variant: 'n', group: 'Group2', order: 2 },
        ]);
    });

    it('filters by quick filter', () => {
        const { result } = renderHook(() => useSortedVariants(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper>
                    <QuickFilterWrapper initialState="p">{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toStrictEqual([{ variant: 'p', group: 'Group1', order: 2 }]);
    });

    it('filters by group filter', () => {
        const { result } = renderHook(() => useSortedVariants(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper initialState="Group1">
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toStrictEqual([
            { variant: 'd', group: 'Group1', order: 1 },
            { variant: 'p', group: 'Group1', order: 2 },
        ]);
    });

    it('filters by both quick filter and group filter', () => {
        const { result } = renderHook(() => useSortedVariants(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper initialState="Group1">
                    <QuickFilterWrapper initialState="p">{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toHaveLength(1);
        expect(result.current[0]).toStrictEqual({ variant: 'p', group: 'Group1', order: 2 });
    });

    it('returns empty array when no variants match filters', () => {
        const { result } = renderHook(() => useSortedVariants(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper initialState="Group3">
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toHaveLength(0);
    });

    it('sorts variants by order', () => {
        jest.mocked(useVariants).mockReturnValue([
            { variant: 'z', group: 'Group1', order: 3 },
            { variant: 'a', group: 'Group1', order: 1 },
            { variant: 'b', group: 'Group1', order: 2 },
        ]);

        const { result } = renderHook(() => useSortedVariants(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toStrictEqual([
            { variant: 'a', group: 'Group1', order: 1 },
            { variant: 'b', group: 'Group1', order: 2 },
            { variant: 'z', group: 'Group1', order: 3 },
        ]);
    });
});
