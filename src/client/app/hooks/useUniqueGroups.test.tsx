import { renderHook } from '@testing-library/react';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useUniqueGroups } from '~/client/app/hooks/useUniqueGroups';

describe('useUniqueGroups', () => {
    const state = { groups: getGroupsFixture() };

    it('returns unique groups from variants', () => {
        const { result } = renderHook(() => useUniqueGroups(getVariantsFixture()), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(['Uogienės', 'Daržovės']);
    });

    it('returns unique groups from details', () => {
        const { result } = renderHook(() => useUniqueGroups(getDetailsFixture()), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(['Uogienės', 'Daržovės']);
    });

    it('returns empty group list for empty list', () => {
        const { result } = renderHook(() => useUniqueGroups([]), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([]);
    });
});
