import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';

vi.mock(import('~/client/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn(),
}));

describe('<ToolbarFilter>', () => {
    const setFilter = vi.fn();

    beforeEach(() => {
        vi.mocked(useQuickFilter).mockReturnValue(['', setFilter]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        await user.type(screen.getByPlaceholderText('type to filter'), 'x');

        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        vi.mocked(useQuickFilter).mockReturnValue(['x', setFilter]);

        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(setFilter).toHaveBeenCalledWith('');
    });
});
