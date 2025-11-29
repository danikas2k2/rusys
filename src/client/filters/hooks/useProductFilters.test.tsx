import { renderHook } from '@testing-library/react';

import React from 'react';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { useProductFilters } from '~/client/filters/hooks/useProductFilters';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';

vi.mock('~/client/filters/hooks/useGroupFilterPredicate', async () => ({
    useGroupFilterPredicate: vi.fn(() => (v: string) => v === 'test-group'),
}));
vi.mock('~/client/filters/hooks/useQuickFilterPredicate', async () => ({
    useQuickFilterPredicate: vi.fn(() => (v: string) => v.includes('test')),
}));

describe('useProductFilters', () => {
    it('returns filter predicates object', () => {
        const { result } = renderHook(() => useProductFilters(), {
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
        const { result } = renderHook(() => useProductFilters(), {
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
        const { result } = renderHook(() => useProductFilters(), {
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
