import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';

import React from 'react';

import { SwipePanel } from '~/client/common/SwipePanel';

jest.mock('~/client/state/groups/useDeleteGroup');

describe('<SwipeControls>', () => {
    const setActiveContent = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders control buttons', () => {
        render(
            <MockActiveContent>
                <SwipePanel />
            </MockActiveContent>
        );

        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('sets the active row to be pinned and editable, and calls onEdit when Edit button is clicked', async () => {
        render(
            <MockActiveContent setState={setActiveContent}>
                <SwipePanel onEdit={onEdit} onRemove={onDelete} />
            </MockActiveContent>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(onEdit).toHaveBeenCalledWith(expect.event('click'));
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith({ editing: true, pinned: true });
    });

    it('set the active row to be pinned when Remove button is clicked (confirmation dialog opens)', async () => {
        render(
            <MockActiveContent state={{}} setState={setActiveContent}>
                <SwipePanel onEdit={onEdit} onRemove={onDelete} />
            </MockActiveContent>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith({ pinned: true });
    });

    it('set the active row to be unpinned when remove action is cancelled', async () => {
        render(
            <MockActiveContent state={{}} setState={setActiveContent}>
                <SwipePanel onEdit={onEdit} onRemove={onDelete} />
            </MockActiveContent>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith({ pinned: true });
        expect(setActiveContent).toHaveBeenLastCalledWith({ pinned: false });
    });

    it('calls onUnpin and onRemove when Remove is confirmed', async () => {
        render(
            <MockActiveContent state={{}} setState={setActiveContent}>
                <SwipePanel onEdit={onEdit} onRemove={onDelete} />
            </MockActiveContent>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledWith(expect.event('click'));
        expect(setActiveContent).toHaveBeenCalledWith({ pinned: true });
        expect(setActiveContent).toHaveBeenLastCalledWith(undefined);
    });
});
