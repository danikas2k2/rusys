import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';

jest.mock('~/client/common/Label');

describe('<ConfirmationDialog>', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('does not render if not open', () => {
        render(<ConfirmationDialog />);

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('renders to the document', () => {
        render(<ConfirmationDialog open />);

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(<ConfirmationDialog open className="test-class" />);

        expect(screen.getByRole('alertdialog')).toHaveClass('test-class');
    });

    it('calls onConfirm when confirm button is clicked', async () => {
        render(<ConfirmationDialog open onConfirm={onConfirm} />);
        const target = screen.getByRole('button', { name: 'Confirm' });
        await userEvent.click(target);

        expect(onConfirm).toHaveBeenCalledWith(expect.event('click', { target }));
    });

    it('calls onClose when close button is clicked', async () => {
        render(<ConfirmationDialog open onClose={onClose} />);
        const target = screen.getByRole('button', { name: 'Close' });
        await userEvent.click(target);

        expect(onClose).toHaveBeenCalledWith(expect.event('click', { target }));
    });

    it('calls onClose when cancel button is clicked', async () => {
        render(<ConfirmationDialog open onClose={onClose} />);
        const target = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(target);

        expect(onClose).toHaveBeenCalledWith(expect.event('click', { target }));
    });
});
