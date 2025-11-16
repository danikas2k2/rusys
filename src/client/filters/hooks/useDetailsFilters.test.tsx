import { renderHook } from '@testing-library/react';

import React from 'react';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { useDetailsFilters } from '~/client/filters/hooks/useDetailsFilters';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';

jest.mock('~/client/filters/hooks/useGroupFilterPredicate', () => ({
    useGroupFilterPredicate: jest.fn(() => (v: string) => v === 'test-group'),
}));
jest.mock('~/client/filters/hooks/useQuickFilterPredicate', () => ({
    useQuickFilterPredicate: jest.fn(() => (v: string) => v.includes('test')),
}));

describe('useDetailsFilters', () => {
    it('returns filter predicates object', () => {
        const { result } = renderHook(() => useDetailsFilters(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current).toStrictEqual({
            name: expect.any(Function),
            group: expect.any(Function),
        });
    });

    it('name predicate filters correctly', () => {
        const { result } = renderHook(() => useDetailsFilters(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current.name('test-value')).toBe(true);
        expect(result.current.name('other-value')).toBe(false);
    });

    it('group predicate filters correctly', () => {
        const { result } = renderHook(() => useDetailsFilters(), {
            wrapper: ({ children }) => (
                <GroupFilterWrapper>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </GroupFilterWrapper>
            ),
        });

        expect(result.current.group('test-group')).toBe(true);
        expect(result.current.group('other-group')).toBe(false);
    });
});
