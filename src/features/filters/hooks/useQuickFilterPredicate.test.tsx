import { renderHook } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';

import React from 'react';

import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { QuickFilterWrapper } from '~/features/filters/QuickFilterContext';

vi.mock(import('~/lib/utils/matchParts'), () => ({
    matchParts: vi.fn((value: string, filter: string) => value.toLowerCase().includes(filter.toLowerCase())),
}));

describe('useQuickFilterPredicate', () => {
    it('returns true when filter is empty', () => {
        const { result } = renderHook(() => useQuickFilterPredicate(), {
            wrapper: ({ children }) => (
                <MockRoute>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </MockRoute>
            ),
        });

        expect(result.current('any-value')).toBe(true);
        expect(result.current('another-value')).toBe(true);
    });

    it('returns true when value matches filter', () => {
        const { result } = renderHook(() => useQuickFilterPredicate(), {
            wrapper: ({ children }) => (
                <MockRoute>
                    <QuickFilterWrapper initialState="test">{children}</QuickFilterWrapper>
                </MockRoute>
            ),
        });

        expect(result.current('test-value')).toBe(true);
        expect(result.current('some-test-value')).toBe(true);
    });

    it('returns false when value does not match filter', () => {
        const { result } = renderHook(() => useQuickFilterPredicate(), {
            wrapper: ({ children }) => (
                <MockRoute>
                    <QuickFilterWrapper initialState="test">{children}</QuickFilterWrapper>
                </MockRoute>
            ),
        });

        expect(result.current('other-value')).toBe(false);
    });
});
