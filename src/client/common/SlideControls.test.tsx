import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withActiveRowContext } from '@tests/withActiveRowContext';
import { SlideControls } from '~/client/common/SlideControls';

jest.mock('~/state/groups/useDeleteGroup');

describe('<SlideControls>', () => {
    const setActiveRow = jest.fn();
    const context = withActiveRowContext({}, setActiveRow);

    const onEdit = jest.fn();
    const onDelete = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders control buttons', () => {
        render(<SlideControls />, withActiveRowContext());

        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('sets the active row to be pinned and editable, and calls onEdit when Edit button is clicked', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} />, context);
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(onEdit).toHaveBeenCalledWith(expect.event('click'));
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveRow).toHaveBeenCalledWith({ editing: true, pinned: true });
    });

    it('set the active row to be pinned when Remove button is clicked (confirmation dialog opens)', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} />, context);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveRow).toHaveBeenCalledWith({ pinned: true });
    });

    it('set the active row to be unpinned when remove action is cancelled', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} />, context);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveRow).toHaveBeenCalledWith({ pinned: true });
        expect(setActiveRow).toHaveBeenLastCalledWith({ pinned: false });
    });

    it('calls onUnpin and onRemove when Remove is confirmed', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} />, context);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledWith(expect.event('click'));
        expect(setActiveRow).toHaveBeenCalledWith({ pinned: true });
        expect(setActiveRow).toHaveBeenLastCalledWith(undefined);
    });
});
