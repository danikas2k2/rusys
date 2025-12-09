import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';

jest.mock('~/client/filters/QuickFilterContext', () => ({
    useQuickFilter: jest.fn(),
}));

describe('<ToolbarFilter>', () => {
    const setFilter = jest.fn();

    beforeEach(() => jest.mocked(useQuickFilter).mockReturnValue(['', setFilter]));

    afterEach(() => jest.clearAllMocks());

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
        jest.mocked(useQuickFilter).mockReturnValue(['x', setFilter]);

        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(setFilter).toHaveBeenCalledWith('');
    });
});
