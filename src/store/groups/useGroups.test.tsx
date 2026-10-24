import { renderHook } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';

import React from 'react';

import { useGroups } from './useGroups';

describe('useGroups', () => {
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns groups from state', () => {
        const { result } = renderHook(() => useGroups(), {
            wrapper: ({ children }) => <MockData state={{ groups }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(groups);
    });

    it('returns an empty array when state.groups is undefined', () => {
        const { result } = renderHook(() => useGroups(), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });
});
