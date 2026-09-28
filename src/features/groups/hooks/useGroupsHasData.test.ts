import { renderHook } from '@testing-library/react';

import { useGroupsHasData } from '~/features/groups/hooks/useGroupsHasData';
import { useGroups } from '~/store/groups/useGroups';

vi.mock(import('~/store/groups/useGroups'));

describe('useGroupsHasData', () => {
    it('returns true when groups has data', () => {
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Group1', order: 1 },
            { group: 'Group2', order: 2 },
        ]);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBe(true);
    });

    it('returns false when groups is empty', () => {
        vi.mocked(useGroups).mockReturnValue([]);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBe(false);
    });

    it('returns false when groups is undefined', () => {
        vi.mocked(useGroups).mockReturnValue(undefined as any);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBe(false);
    });

    it('returns false when groups is null', () => {
        vi.mocked(useGroups).mockReturnValue(null as any);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBe(false);
    });
});
