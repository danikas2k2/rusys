import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { act, use } from 'react';

import { QuickFilterContext, QuickFilterWrapper, useQuickFilter } from '~/client/filters/QuickFilterContext';

function TestComponent() {
    const [filter, setFilter] = useQuickFilter();

    return (
        <div>
            <span aria-label="filter-value">{filter}</span>
            <button onClick={() => setFilter('new filter')}>Set Filter</button>
            <button onClick={() => setFilter('')}>Clear Filter</button>
        </div>
    );
}

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
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
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
            wrapper: ({ children }) => <QuickFilterWrapper>{children}</QuickFilterWrapper>,
        });

        act(() => result.current[1]('new filter'));

        expect(result.current[0]).toBe('new filter');
    });

    it('updates and clears filter via UI', async () => {
        render(
            <QuickFilterWrapper>
                <TestComponent />
            </QuickFilterWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Set Filter' }));
        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('new filter');

        await user.click(screen.getByRole('button', { name: 'Clear Filter' }));
        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');
    });
});
