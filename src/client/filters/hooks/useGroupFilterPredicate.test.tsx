import { renderHook } from '@testing-library/react';

import React from 'react';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';

describe('useGroupFilterPredicate', () => {
    it('returns true when filter is empty', () => {
        const { result } = renderHook(() => useGroupFilterPredicate(), {
            wrapper: ({ children }) => <GroupFilterWrapper>{children}</GroupFilterWrapper>,
        });

        expect(result.current('any-group')).toBe(true);
        expect(result.current('another-group')).toBe(true);
    });

    it('returns true when value matches filter', () => {
        const { result } = renderHook(() => useGroupFilterPredicate(), {
            wrapper: ({ children }) => <GroupFilterWrapper initialState="test-group">{children}</GroupFilterWrapper>,
        });

        expect(result.current('test-group')).toBe(true);
    });

    it('returns false when value does not match filter', () => {
        const { result } = renderHook(() => useGroupFilterPredicate(), {
            wrapper: ({ children }) => <GroupFilterWrapper initialState="test-group">{children}</GroupFilterWrapper>,
        });

        expect(result.current('other-group')).toBe(false);
    });
});
