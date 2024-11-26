import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SlideControls } from '~/client/common/SlideControls';

jest.mock('~/state/groups/useDeleteGroup');

describe('SlideControls', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onPin = jest.fn();
    const onUnpin = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders control buttons', () => {
        render(<SlideControls />);
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('calls onPin and onEdit when Edit button is clicked', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} />);
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(onEdit).toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
    });

    it('calls onPin when Remove button is clicked', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
    });

    it('calls onUnpin when Remove is cancelled', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).toHaveBeenCalled();
    });

    it('calls onUnpin and onRemove when Remove is confirmed', async () => {
        render(<SlideControls onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalled();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).toHaveBeenCalled();
    });
});
