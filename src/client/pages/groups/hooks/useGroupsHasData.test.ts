import { renderHook } from '@testing-library/react';

import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useGroups } from '~/client/state/groups/useGroups';

jest.mock('~/client/state/groups/useGroups');

describe('useGroupsHasData', () => {
    it('returns true when groups has data', () => {
        jest.mocked(useGroups).mockReturnValue([
            { group: 'Group1', order: 1 },
            { group: 'Group2', order: 2 },
        ]);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBeTrue();
    });

    it('returns false when groups is empty', () => {
        jest.mocked(useGroups).mockReturnValue([]);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false when groups is undefined', () => {
        jest.mocked(useGroups).mockReturnValue(undefined as any);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false when groups is null', () => {
        jest.mocked(useGroups).mockReturnValue(null as any);

        const { result } = renderHook(() => useGroupsHasData());

        expect(result.current).toBeFalse();
    });
});

