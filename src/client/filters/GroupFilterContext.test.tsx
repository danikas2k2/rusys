import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { MockRoute } from '~/tests/MockRoute';
import { GroupFilterWrapper, useGroupFilter } from './GroupFilterContext';

function TestComponent({ paramName = 'g' }: { paramName?: string }) {
    const [filter, setFilter] = useGroupFilter();
    const [searchParams] = useSearchParams();

    return (
        <div>
            <span aria-label="filter-value">{filter}</span>
            <span aria-label="search-value">{searchParams.get(paramName) || ''}</span>
            <button onClick={() => setFilter('test')}>Set Filter</button>
            <button onClick={() => setFilter('')}>Clear Filter</button>
        </div>
    );
}

describe('<GroupFilterWrapper>', () => {
    it('provides initial filter value', () => {
        render(
            <MockRoute>
                <MockTheme>
                    <GroupFilterWrapper initialState="initial">
                        <TestComponent />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        expect(screen.getByText('initial')).toBeInTheDocument();
    });

    it('provides empty string as default initial value', () => {
        render(
            <MockRoute>
                <MockTheme>
                    <GroupFilterWrapper>
                        <TestComponent />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');
    });

    it('allows updating filter value', async () => {
        render(
            <MockRoute>
                <MockTheme>
                    <GroupFilterWrapper>
                        <TestComponent />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: 'Set Filter' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('test');
    });

    it('reads initial filter from search params', () => {
        render(
            <MockRoute initialEntries={['/?g=fruit']}>
                <MockTheme>
                    <GroupFilterWrapper>
                        <TestComponent />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('fruit');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('fruit');
    });

    it('uses custom param name when provided', () => {
        render(
            <MockRoute initialEntries={['/?group=fruit']}>
                <MockTheme>
                    <GroupFilterWrapper paramName="group">
                        <TestComponent paramName="group" />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('fruit');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('fruit');
    });

    it('syncs search params on update', async () => {
        render(
            <MockRoute>
                <MockTheme>
                    <GroupFilterWrapper>
                        <TestComponent />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        await user.click(screen.getByRole('button', { name: 'Set Filter' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('test');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('test');
    });

    it('clears search param when filter is cleared', async () => {
        render(
            <MockRoute initialEntries={['/?g=fruit']}>
                <MockTheme>
                    <GroupFilterWrapper>
                        <TestComponent />
                    </GroupFilterWrapper>
                </MockTheme>
            </MockRoute>
        );

        await user.click(screen.getByRole('button', { name: 'Clear Filter' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');
        expect(screen.getByRole('generic', { name: 'search-value' })).toHaveTextContent('');
    });
});
