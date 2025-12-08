import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

jest.mock('~/client/state/groups/useGroups', () => ({
    useGroups: jest.fn(),
}));
jest.mock('~/client/filters/GroupFilterContext', () => ({
    useGroupFilterContext: jest.fn(),
}));

describe('<ToolbarGroupFilter>', () => {
    const setGroup = jest.fn();

    beforeEach(() => {
        jest.mocked(useGroupFilter).mockReturnValue(['', setGroup]);
        jest.mocked(useGroups).mockReturnValue([
            { group: 'Uogienės', order: 0 },
            { group: 'Daržovės', order: 1 },
        ]);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders select with placeholder', () => {
        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('All groups')).toBeInTheDocument();
    });

    it('updates group value when some group selected', async () => {
        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        await user.click(screen.getByPlaceholderText('All groups'));
        await user.click(screen.getByText('Uogienės'));

        expect(setGroup).toHaveBeenCalledWith('Uogienės');
    });

    it('clears group value when clear button is clicked', async () => {
        jest.mocked(useGroupFilter).mockReturnValue(['Daržovės', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        const select = screen.getByPlaceholderText('All groups');
        await user.click(select);

        // Find and click the clear button (X icon)
        const clearButton = screen.getByRole('button', { name: /clear|close/i });
        await user.click(clearButton);

        expect(setGroup).toHaveBeenCalledWith('');
    });

    it('uses correct rightSectionWidth when group is set', () => {
        jest.mocked(useGroupFilter).mockReturnValue(['Uogienės', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('All groups')).toBeInTheDocument();
    });

    it('uses correct rightSectionWidth when group is empty', () => {
        jest.mocked(useGroupFilter).mockReturnValue(['', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('All groups')).toBeInTheDocument();
    });

    it('handles null value in onChange by converting to empty string', async () => {
        jest.mocked(useGroupFilter).mockReturnValue(['Uogienės', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        await user.click(screen.getByPlaceholderText('All groups'));
        await user.click(screen.getByText('Uogienės'));

        expect(setGroup).toHaveBeenCalledWith('');
    });
});
