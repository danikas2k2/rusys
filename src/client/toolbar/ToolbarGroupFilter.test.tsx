import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { useClearGroup } from '~/state/group/useClearGroup';
import { useGroup } from '~/state/group/useGroup';
import { useSetGroup } from '~/state/group/useSetGroup';

jest.mock('~/state/groups/useGroups');
jest.mock('~/state/group/useGroup');
jest.mock('~/state/group/useSetGroup');
jest.mock('~/state/group/useClearGroup');

describe('<ToolbarGroupFilter>', () => {
    beforeEach(() => {
        jest.mocked(useGroup).mockReturnValue('');
        jest.mocked(useSetGroup).mockReturnValue(jest.fn());
        jest.mocked(useClearGroup).mockReturnValue(jest.fn());
    });

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
        const setGroup = jest.fn();
        jest.mocked(useSetGroup).mockReturnValue(setGroup);

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
        const clearGroup = jest.fn();
        jest.mocked(useClearGroup).mockReturnValue(clearGroup);
        jest.mocked(useGroup).mockReturnValue('Daržovės');

        render(
            <MockRedux>
                <ToolbarGroupFilter />
            </MockRedux>
        );

        await userEvent.click(screen.getByPlaceholderText('Daržovės'));
        await userEvent.click(screen.getByText('All groups'));

        expect(clearGroup).toHaveBeenCalledWith();
    });
});
