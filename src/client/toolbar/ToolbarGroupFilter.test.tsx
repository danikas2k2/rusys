import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useGroupFilterContext } from '~/client/filters/GroupFilterContext';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/filters/GroupFilterContext');

describe('<ToolbarGroupFilter>', () => {
    const setGroup = jest.fn();

    beforeEach(() => jest.mocked(useGroupFilterContext).mockReturnValue(['', setGroup]));

    afterEach(() => jest.clearAllMocks());

    it('renders select with placeholder', () => {
        render(
            <MockRedux>
                <ToolbarGroupFilter />
            </MockRedux>
        );

        expect(screen.getByPlaceholderText('All groups')).toBeInTheDocument();
    });

    it('updates group value when some group selected', async () => {
        render(
            <MockRedux>
                <ToolbarGroupFilter />
            </MockRedux>
        );

        await userEvent.click(screen.getByPlaceholderText('All groups'));
        await userEvent.click(screen.getByText('Uogienės'));

        expect(setGroup).toHaveBeenCalledWith('Uogienės');
    });

    it('clears group value when clear button is clicked', async () => {
        jest.mocked(useGroupFilterContext).mockReturnValue(['Daržovės', setGroup]);

        render(
            <MockRedux>
                <ToolbarGroupFilter />
            </MockRedux>
        );

        await userEvent.click(screen.getByPlaceholderText('Daržovės'));
        await userEvent.click(screen.getByText('All groups'));

        expect(setGroup).toHaveBeenCalledWith('');
    });
});
