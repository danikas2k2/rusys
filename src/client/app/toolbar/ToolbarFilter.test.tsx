import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useQuickFilterContext } from '~/client/app/filters/QuickFilterContext';
import { ToolbarFilter } from '~/client/app/toolbar/ToolbarFilter';

jest.mock('~/client/app/filters/QuickFilterContext');

describe('<ToolbarFilter>', () => {
    const setFilter = jest.fn();

    beforeEach(() => jest.mocked(useQuickFilterContext).mockReturnValue(['', setFilter]));

    afterEach(() => jest.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(
            <MockRedux>
                <ToolbarFilter />
            </MockRedux>
        );

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        render(
            <MockRedux>
                <ToolbarFilter />
            </MockRedux>
        );

        await userEvent.type(screen.getByPlaceholderText('type to filter'), 'x');

        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        jest.mocked(useQuickFilterContext).mockReturnValue(['x', setFilter]);

        render(
            <MockRedux>
                <ToolbarFilter />
            </MockRedux>
        );

        await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

        expect(setFilter).toHaveBeenCalledWith('');
    });
});
