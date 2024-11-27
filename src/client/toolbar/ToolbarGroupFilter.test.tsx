import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { useClearGroup } from '~/state/group/useClearGroup';
import { useGroup } from '~/state/group/useGroup';
import { useSetGroup } from '~/state/group/useSetGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/groups/useGroups');
jest.mock('~/state/group/useGroup');
jest.mock('~/state/group/useSetGroup');
jest.mock('~/state/group/useClearGroup');

describe('ToolbarGroupFilter', () => {
    beforeEach(() => {
        (useGroup as jest.Mock).mockReturnValue('');
        (useSetGroup as jest.Mock).mockReturnValue(jest.fn());
        (useClearGroup as jest.Mock).mockReturnValue(jest.fn());
    });

    afterEach(() => jest.clearAllMocks());

    it('renders select with placeholder', () => {
        render(<ToolbarGroupFilter />, withReduxState());
        expect(screen.getByPlaceholderText('All groups')).toBeInTheDocument();
    });

    it('updates group value when some group selected', async () => {
        const setGroup = jest.fn();
        (useSetGroup as jest.Mock).mockReturnValue(setGroup);

        render(<ToolbarGroupFilter />, withReduxState());

        await userEvent.click(screen.getByPlaceholderText('All groups'));
        await userEvent.click(screen.getByText('Uogienės'));
        expect(setGroup).toHaveBeenCalledWith('Uogienės');
    });

    it('clears group value when clear button is clicked', async () => {
        const clearGroup = jest.fn();
        (useClearGroup as jest.Mock).mockReturnValue(clearGroup);
        (useGroup as jest.Mock).mockReturnValue('Daržovės');

        render(<ToolbarGroupFilter />, withReduxState());

        await userEvent.click(screen.getByPlaceholderText('Daržovės'));
        await userEvent.click(screen.getByText('All groups'));
        expect(clearGroup).toHaveBeenCalled();
    });
});
