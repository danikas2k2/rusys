import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { GroupControls } from '~/client/groups/GroupControls';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/groups/useDeleteGroup');

describe('GroupControls', () => {
    const onPin = jest.fn();
    const onUnpin = jest.fn();
    const deleteGroup = jest.fn();

    beforeEach(() => {
        (useDeleteGroup as jest.Mock).mockReturnValue(deleteGroup);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders edit and remove buttons', () => {
        render(<GroupControls group="Uogienės" />, withReduxState());
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('opens dialog when edit button is clicked', async () => {
        render(<GroupControls group="Uogienės" onPin={onPin} onUnpin={onUnpin} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
    });

    it('unpin controls when dialog is closed', async () => {
        render(<GroupControls group="Uogienės" onPin={onPin} onUnpin={onUnpin} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onUnpin).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(onUnpin).toHaveBeenCalledWith();
    });

    it('calls deleteGroup and onUnpin when remove button is confirmed', async () => {
        render(<GroupControls group="Uogienės" onPin={onPin} onUnpin={onUnpin} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
        expect(deleteGroup).toHaveBeenCalledWith('Uogienės');
        expect(onUnpin).toHaveBeenCalledWith(true);
    });
});
