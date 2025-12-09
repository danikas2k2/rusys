import { renderHook } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { isEqual } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';

jest.mock('lodash', () => ({
    ...jest.requireActual('lodash'),
    isEqual: jest.fn(() => true),
}));

describe('useGroups', () => {
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

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
