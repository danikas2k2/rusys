import { act, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';

jest.mock('~/client/common/Label');

describe('<ConfirmationDialog>', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('does not render if not open', () => {
        render(
            <MockTheme>
                <ConfirmationDialog opened={false} onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
    });

    it('renders to the document', () => {
        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(
            <MockTheme>
                <ConfirmationDialog opened className="test-class" onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.getByRole('alertdialog')).toHaveClass('test-class');
    });

    it('calls onConfirm when confirm button is clicked', async () => {
        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );
        const target = screen.getByRole('button', { name: 'Confirm' });
        await user.click(target);

        expect(onConfirm).toHaveBeenCalledWith(expect.event('click', { target }));
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose when cancel button is clicked', async () => {
        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );
        const target = screen.getByRole('button', { name: 'Cancel' });
        await user.click(target);

        expect(onClose).toHaveBeenCalledWith(expect.event('click', { target }));
    });

    it('shows loading state after 300ms delay', async () => {
        jest.useFakeTimers();
        const userWithTimers = user.setup({ advanceTimers: jest.advanceTimersByTime });
        const slowConfirm = jest.fn(() => new Promise<void>((resolve) => setTimeout(() => resolve(), 500)));

        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={slowConfirm} onClose={onClose} />
            </MockTheme>
        );

        const confirmButton = screen.getByRole('button', { name: 'Confirm' });
        await userWithTimers.click(confirmButton);

        expect(confirmButton).not.toBeDisabled();

        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        expect(confirmButton).toBeDisabled();

        await act(async () => {
            jest.advanceTimersByTime(200);
            await jest.runAllTimersAsync();
        });

        expect(confirmButton).not.toBeDisabled();
        expect(slowConfirm).toHaveBeenCalledWith(expect.any(Object));
    });

    it('displays error message when onConfirm throws', async () => {
        const errorMessage = 'Test error message';
        const failingConfirm = jest.fn().mockRejectedValue(new Error(errorMessage));

        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={failingConfirm} onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
        expect(onClose).not.toHaveBeenCalled();
    });
});
