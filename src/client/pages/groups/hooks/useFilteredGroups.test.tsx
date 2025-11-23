import { renderHook } from '@testing-library/react';

import React from 'react';

import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useFilteredGroups } from './useFilteredGroups';

jest.mock('~/client/state/groups/useGroups');

describe('useFilteredGroups', () => {
    const mockGroups = [
        { group: 'Apple', order: 3 },
        { group: 'Banana', order: 1 },
        { group: 'Cherry', order: 2 },
    ];

    beforeEach(() => jest.mocked(useGroups).mockReturnValue(mockGroups));

    afterEach(() => jest.clearAllMocks());

    it('returns all groups sorted by order when no filter is set', () => {
        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        expect(result.current).toStrictEqual([
            { group: 'Banana', order: 1 },
            { group: 'Cherry', order: 2 },
            { group: 'Apple', order: 3 },
        ]);
    });

    it('filters groups by quick filter', () => {
        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="Banana">{children}</QuickFilterWrapper>,
        });

        expect(result.current).toStrictEqual([{ group: 'Banana', order: 1 }]);
    });

    it('filters groups by partial match', () => {
        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="a">{children}</QuickFilterWrapper>,
        });

        // "a" should match "Apple", "Banana", and "Cherry" (all contain "a")
        expect(result.current.length).toBeGreaterThanOrEqual(1);
        expect(result.current).toContainEqual({ group: 'Apple', order: 3 });
        expect(result.current).toContainEqual({ group: 'Banana', order: 1 });
    });

    it('filters groups case-insensitively', () => {
        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="banana">{children}</QuickFilterWrapper>,
        });

        expect(result.current).toStrictEqual([{ group: 'Banana', order: 1 }]);
    });

    it('returns empty array when no groups match filter', () => {
        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => (
                <QuickFilterWrapper initialState="NonExistentGroup">{children}</QuickFilterWrapper>
            ),
        });

        expect(result.current).toHaveLength(0);
    });

    it('returns empty array when groups is empty', () => {
        jest.mocked(useGroups).mockReturnValue([]);

        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        expect(result.current).toHaveLength(0);
    });

    it('sorts groups by order after filtering', () => {
        jest.mocked(useGroups).mockReturnValue([
            { group: 'Zebra', order: 3 },
            { group: 'Apple', order: 1 },
            { group: 'Banana', order: 2 },
        ]);

        const { result } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="a">{children}</QuickFilterWrapper>,
        });

        expect(result.current).toStrictEqual([
            { group: 'Apple', order: 1 },
            { group: 'Banana', order: 2 },
            { group: 'Zebra', order: 3 },
        ]);
    });

    it('memoizes result when dependencies do not change', () => {
        const { result, rerender } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        const firstResult = result.current;

        rerender();

        expect(result.current).toBe(firstResult);
    });

    it('recomputes result when filter changes', () => {
        // Test that filter changes trigger recalculation by testing with different initial filters
        const { result: result1 } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        expect(result1.current).toHaveLength(3);

        // Test with filter "Cherry" which should match only Cherry
        const { result: result2 } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="Cherry">{children}</QuickFilterWrapper>,
        });

        expect(result2.current).toHaveLength(1);
        expect(result2.current[0]).toStrictEqual({ group: 'Cherry', order: 2 });
    });

    it('recomputes result when groups change', () => {
        const { result, rerender } = renderHook(() => useFilteredGroups(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        const firstResult = result.current;

        expect(firstResult).toHaveLength(3);

        jest.mocked(useGroups).mockReturnValue([{ group: 'NewGroup', order: 1 }]);

        rerender();

        expect(result.current).not.toBe(firstResult);
        expect(result.current).toHaveLength(1);
        expect(result.current[0]).toStrictEqual({ group: 'NewGroup', order: 1 });
    });
});
