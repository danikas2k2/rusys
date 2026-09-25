import { renderHook } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useHasReviewGroups } from '~/features/groups/hooks/useHasReviewGroups';

describe('useHasReviewGroups', () => {
    it('returns false for empty state', () => {
        const { result } = renderHook(() => useHasReviewGroups(), { wrapper: MockRedux });

        expect(result.current).toBe(false);
    });

    it('returns false when no group is under review', () => {
        const groups = getGroupsFixture();
        const { result } = renderHook(() => useHasReviewGroups(), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(false);
    });

    it('returns true when a group is under review', () => {
        const groups = getGroupsFixture().map((g, i) => (i === 0 ? { ...g, review: true } : g));
        const { result } = renderHook(() => useHasReviewGroups(), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(true);
    });
});
