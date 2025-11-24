import { renderHook } from '@testing-library/react';

import React from 'react';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useVisibleGroups } from './useVisibleGroups';

jest.mock('~/client/state/groups/useGroups');

describe('useVisibleGroups', () => {
    const mockGroups = [
        { group: 'Group1', order: 1 },
        { group: 'Group2', order: 2 },
        { group: 'Group3', order: 3 },
    ];

    beforeEach(() => jest.mocked(useGroups).mockReturnValue(mockGroups));

    afterEach(() => jest.clearAllMocks());

    it('returns all groups when no group filter is set', () => {
        const { result } = renderHook(() => useVisibleGroups(), {
            wrapper: ({ children }) => <GroupFilterWrapper>{children}</GroupFilterWrapper>,
        });

        expect(result.current).toStrictEqual(['Group1', 'Group2', 'Group3']);
    });

    it('returns single group array when group filter is set', () => {
        const { result } = renderHook(() => useVisibleGroups(), {
            wrapper: ({ children }) => <GroupFilterWrapper initialState="Group2">{children}</GroupFilterWrapper>,
        });

        expect(result.current).toStrictEqual(['Group2']);
    });

    it('returns empty array when groups is empty and no filter is set', () => {
        jest.mocked(useGroups).mockReturnValue([]);

        const { result } = renderHook(() => useVisibleGroups(), {
            wrapper: ({ children }) => <GroupFilterWrapper>{children}</GroupFilterWrapper>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns single group array when group filter is set even if groups is empty', () => {
        jest.mocked(useGroups).mockReturnValue([]);

        const { result } = renderHook(() => useVisibleGroups(), {
            wrapper: ({ children }) => <GroupFilterWrapper initialState="Group1">{children}</GroupFilterWrapper>,
        });

        expect(result.current).toStrictEqual(['Group1']);
    });
});
