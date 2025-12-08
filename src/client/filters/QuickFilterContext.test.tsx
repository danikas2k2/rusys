import { renderHook } from '@testing-library/react';

import React, { act, use } from 'react';

import { QuickFilterContext, QuickFilterWrapper, useQuickFilter } from '~/client/filters/QuickFilterContext';

describe('<QuickFilterContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(QuickFilterContext));

        expect(result.current).toStrictEqual(['', expect.any(Function)]);
    });
});

describe('useQuickFilterContext', () => {
    it('returns default filter', () => {
        const { result } = renderHook(() => useQuickFilter());

        expect(result.current).toStrictEqual(['', expect.any(Function)]);
    });

    it('returns custom filter from context', () => {
        const setFilter = jest.fn();

        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: ({ children }) => <QuickFilterContext value={['test', setFilter]}>{children}</QuickFilterContext>,
        });

        expect(result.current).toStrictEqual(['test', setFilter]);
    });
});

describe('<QuickFilterWrapper>', () => {
    it('provides state to children with default initial state', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: QuickFilterWrapper,
        });

        expect(result.current).toStrictEqual(['', expect.any(Function)]);
    });

    it('provides state to children with custom initial state', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: ({ children }) => <QuickFilterWrapper initialState="initial">{children}</QuickFilterWrapper>,
        });

        expect(result.current).toStrictEqual(['initial', expect.any(Function)]);
    });

    it('updates filter state', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: QuickFilterWrapper,
        });

        act(() => result.current[1]('new filter'));

        expect(result.current[0]).toBe('new filter');
    });
});
