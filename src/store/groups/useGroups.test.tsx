import { renderHook } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useGroups } from './useGroups';

describe('useGroups', () => {
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns groups from state', () => {
        const { result } = renderHook(() => useGroups(), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(groups);
    });

    it('returns an empty array when state.groups is undefined', () => {
        const { result } = renderHook(() => useGroups(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });
});
