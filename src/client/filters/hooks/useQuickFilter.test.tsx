import { renderHook } from '@testing-library/react';

import React from 'react';

import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';

describe('useQuickFilter', () => {
    it('returns current quick filter value', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="test-filter">{children}</QuickFilterWrapper>,
        });

        expect(result.current).toBe('test-filter');
    });

    it('returns empty string when no filter is set', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        expect(result.current).toBe('');
    });
});
