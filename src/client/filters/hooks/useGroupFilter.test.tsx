import { renderHook } from '@testing-library/react';

import React from 'react';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';

describe('useGroupFilter', () => {
    it('returns current group filter value', () => {
        const { result } = renderHook(() => useGroupFilter(), {
            wrapper: ({ children }) => <GroupFilterWrapper initialState="test-group">{children}</GroupFilterWrapper>,
        });

        expect(result.current).toBe('test-group');
    });

    it('returns empty string when no filter is set', () => {
        const { result } = renderHook(() => useGroupFilter(), {
            wrapper: ({ children }) => <GroupFilterWrapper>{children}</GroupFilterWrapper>,
        });

        expect(result.current).toBe('');
    });
});
