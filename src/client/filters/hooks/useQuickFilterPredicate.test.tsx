import { renderHook } from '@testing-library/react';

import React from 'react';

import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';

jest.mock('~/client/utils/matchParts', () => ({
    matchParts: jest.fn((value: string, filter: string) => value.toLowerCase().includes(filter.toLowerCase())),
}));

describe('useQuickFilterPredicate', () => {
    it('returns true when filter is empty', () => {
        const { result } = renderHook(() => useQuickFilterPredicate(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        expect(result.current('any-value')).toBe(true);
        expect(result.current('another-value')).toBe(true);
    });

    it('returns true when value matches filter', () => {
        const { result } = renderHook(() => useQuickFilterPredicate(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="test">{children}</QuickFilterWrapper>,
        });

        expect(result.current('test-value')).toBe(true);
        expect(result.current('some-test-value')).toBe(true);
    });

    it('returns false when value does not match filter', () => {
        const { result } = renderHook(() => useQuickFilterPredicate(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="test">{children}</QuickFilterWrapper>,
        });

        expect(result.current('other-value')).toBe(false);
    });
});
