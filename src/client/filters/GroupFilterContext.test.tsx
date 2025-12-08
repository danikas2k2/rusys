import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { GroupFilterWrapper, useGroupFilter } from './GroupFilterContext';

function TestComponent() {
    const [filter, setFilter] = useGroupFilter();

    return (
        <div>
            <span aria-label="filter-value">{filter}</span>
            <button onClick={() => setFilter('test')}>Set Filter</button>
        </div>
    );
}

describe('<GroupFilterWrapper>', () => {
    it('provides initial filter value', () => {
        render(
            <MockTheme>
                <GroupFilterWrapper initialState="initial">
                    <TestComponent />
                </GroupFilterWrapper>
            </MockTheme>
        );

        expect(screen.getByText('initial')).toBeInTheDocument();
    });

    it('provides empty string as default initial value', () => {
        render(
            <MockTheme>
                <GroupFilterWrapper>
                    <TestComponent />
                </GroupFilterWrapper>
            </MockTheme>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');
    });

    it('allows updating filter value', async () => {
        render(
            <MockTheme>
                <GroupFilterWrapper>
                    <TestComponent />
                </GroupFilterWrapper>
            </MockTheme>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: 'Set Filter' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('test');
    });
});
