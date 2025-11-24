import { renderHook } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import type { WithGroupsState } from '~/client/state/groups/types';
import { useGroup } from '~/client/state/groups/useGroup';

describe('useGroup', () => {
    const groups = getGroupsFixture();
    const state: WithGroupsState = { groups };

    it('returns group by name', () => {
        const { result } = renderHook(() => useGroup('Uogienės'), {
            wrapper: ({ children }) => React.createElement(MockApp, { state }, children),
        });

        expect(result.current).toStrictEqual({ group: 'Uogienės', annual: true, order: 1 });
    });

    it('returns undefined for non-existent group', () => {
        const { result } = renderHook(() => useGroup('NonExistent'), {
            wrapper: ({ children }) => React.createElement(MockApp, { state }, children),
        });

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when groups state is empty', () => {
        const emptyState: WithGroupsState = { groups: [] };
        const { result } = renderHook(() => useGroup('Uogienės'), {
            wrapper: ({ children }) => React.createElement(MockApp, { state: emptyState }, children),
        });

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when groups state is undefined', () => {
        const undefinedState: WithGroupsState = {};
        const { result } = renderHook(() => useGroup('Uogienės'), {
            wrapper: ({ children }) => React.createElement(MockApp, { state: undefinedState }, children),
        });

        expect(result.current).toBeUndefined();
    });
});
