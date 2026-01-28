import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { act, use } from 'react';
import { useSearchParams } from 'react-router-dom';

import { QuickFilterContext, QuickFilterWrapper, useQuickFilter } from '~/client/filters/QuickFilterContext';
import { MockRoute } from '~/tests/MockRoute';

function TestComponent({ paramName = 'q' }: { paramName?: string }) {
    const [filter, setFilter] = useQuickFilter();
    const [searchParams] = useSearchParams();

    return (
        <div>
            <span aria-label="filter-value">{filter}</span>
            <span aria-label="search-value">{searchParams.get(paramName) || ''}</span>
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
            wrapper: ({ children }) => (
                <MockRoute>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </MockRoute>
            ),
        });

        expect(result.current).toStrictEqual(['', expect.any(Function)]);
    });

    it('provides state to children with custom initial state', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: ({ children }) => (
                <MockRoute>
                    <QuickFilterWrapper initialState="initial">{children}</QuickFilterWrapper>
                </MockRoute>
            ),
        });

        expect(result.current).toStrictEqual(['initial', expect.any(Function)]);
    });

    it('updates filter state', () => {
        const { result } = renderHook(() => useQuickFilter(), {
            wrapper: ({ children }) => (
                <MockRoute>
                    <QuickFilterWrapper>{children}</QuickFilterWrapper>
                </MockRoute>
            ),
        });

        act(() => result.current[1]('new filter'));

        expect(result.current[0]).toBe('new filter');
    });

    it('reads initial state from search params', () => {
        render(
            <MockRoute initialEntries={['/?q=initial']}>
                <QuickFilterWrapper>
                    <TestComponent />
                </QuickFilterWrapper>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('initial');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('initial');
    });

    it('uses custom param name when provided', () => {
        render(
            <MockRoute initialEntries={['/?f=custom']}>
                <QuickFilterWrapper paramName="f">
                    <TestComponent paramName="f" />
                </QuickFilterWrapper>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('custom');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('custom');
    });

    it('syncs updates to search params', async () => {
        render(
            <MockRoute>
                <QuickFilterWrapper>
                    <TestComponent />
                </QuickFilterWrapper>
            </MockRoute>
        );

        await user.click(screen.getByRole('button', { name: 'Set Filter' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('new filter');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('new filter');
    });

    it('clears search param when filter is empty', async () => {
        render(
            <MockRoute initialEntries={['/?q=initial']}>
                <QuickFilterWrapper>
                    <TestComponent />
                </QuickFilterWrapper>
            </MockRoute>
        );

        await user.click(screen.getByRole('button', { name: 'Clear Filter' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('');
    });
});
