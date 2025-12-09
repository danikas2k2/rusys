import { renderHook } from '@testing-library/react';

import { useGroups } from '~/client/state/groups/useGroups';
import { useSortedGroups } from './useSortedGroups';

jest.mock('~/client/state/groups/useGroups');

describe('useSortedGroups', () => {
    const mockGroups = [
        { group: 'Apple', order: 3 },
        { group: 'Banana', order: 1 },
        { group: 'Cherry', order: 2 },
    ];

    beforeEach(() => jest.mocked(useGroups).mockReturnValue(mockGroups));

    afterEach(() => jest.clearAllMocks());

    it('returns groups sorted by order', () => {
        const { result } = renderHook(() => useSortedGroups());

        expect(result.current).toStrictEqual([
            { group: 'Banana', order: 1 },
            { group: 'Cherry', order: 2 },
            { group: 'Apple', order: 3 },
        ]);
    });

    it('returns empty array when groups is empty', () => {
        jest.mocked(useGroups).mockReturnValue([]);

        const { result } = renderHook(() => useSortedGroups());

        expect(result.current).toHaveLength(0);
    });

    it('memoizes result when dependencies do not change', () => {
        const { result, rerender } = renderHook(() => useSortedGroups());

        const firstResult = result.current;

        rerender();

        expect(result.current).toBe(firstResult);
    });

    it('recomputes result when groups change', () => {
        const { result, rerender } = renderHook(() => useSortedGroups());

        const firstResult = result.current;

        expect(firstResult).toHaveLength(3);

        jest.mocked(useGroups).mockReturnValue([{ group: 'NewGroup', order: 1 }]);

        rerender();

        expect(result.current).not.toBe(firstResult);
        expect(result.current).toHaveLength(1);
        expect(result.current[0]).toStrictEqual({ group: 'NewGroup', order: 1 });
    });
});
