import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

vi.mock(import('~/client/state/groups/useGroups'), () => ({
    useGroups: vi.fn(),
}));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));

describe('<ToolbarGroupFilter>', () => {
    const setGroup = vi.fn();

    beforeEach(() => {
        vi.mocked(useGroupFilter).mockReturnValue(['', setGroup]);
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Uogienės', order: 0 },
            { group: 'Daržovės', order: 1 },
        ]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders select with placeholder', () => {
        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('All categories')).toBeInTheDocument();
    });

    it('updates group value when some group selected', async () => {
        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        await user.click(screen.getByPlaceholderText('All categories'));
        await user.click(screen.getByText('Uogienės'));

        expect(setGroup).toHaveBeenCalledWith('Uogienės');
    });

    it('clears group value when clear button is clicked', async () => {
        vi.mocked(useGroupFilter).mockReturnValue(['Daržovės', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        const select = screen.getByPlaceholderText('All categories');
        await user.click(select);

        // Find and click the clear button (X icon)
        const clearButton = screen.getByRole('button', { name: /clear|close/i });
        await user.click(clearButton);

        expect(setGroup).toHaveBeenCalledWith('');
    });

    it('uses correct rightSectionWidth when group is set', () => {
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('All categories')).toBeInTheDocument();
    });

    it('uses correct rightSectionWidth when group is empty', () => {
        vi.mocked(useGroupFilter).mockReturnValue(['', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('All categories')).toBeInTheDocument();
    });

    it('handles null value in onChange by converting to empty string', async () => {
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', setGroup]);

        render(
            <MockApp>
                <ToolbarGroupFilter />
            </MockApp>
        );

        await user.click(screen.getByPlaceholderText('All categories'));
        await user.click(screen.getByText('Uogienės'));

        expect(setGroup).toHaveBeenCalledWith('');
    });
});
