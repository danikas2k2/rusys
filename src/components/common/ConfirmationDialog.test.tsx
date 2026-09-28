import { act, fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { expectEvent } from '@tests/matchers';
import { MockTheme } from '@tests/MockTheme';

import { Button } from '@mantine/core';
import React from 'react';

import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';

vi.mock(import('~/components/common/Label'));

describe('<ConfirmationDialog>', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
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

        expect(onConfirm).toHaveBeenCalledWith(expectEvent('click', { target }));
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

        expect(onClose).toHaveBeenCalledWith(expectEvent('click', { target }));
    });

    it('shows loading state after 300ms delay', async () => {
        let resolveConfirm: () => void;
        const slowConfirm = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveConfirm = resolve;
                })
        );

        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={slowConfirm} onClose={onClose} />
            </MockTheme>
        );

        vi.useFakeTimers();
        try {
            const confirmButton = screen.getByRole('button', { name: 'Confirm' });
            act(() => fireEvent.click(confirmButton));

            expect(confirmButton).not.toBeDisabled();

            await act(() => vi.advanceTimersByTimeAsync(300));

            expect(confirmButton).toBeDisabled();

            await act(async () => {
                resolveConfirm();
                await vi.runAllTimersAsync();
            });

            expect(confirmButton).not.toBeDisabled();
            expect(slowConfirm).toHaveBeenCalledWith(expect.any(Object));
        } finally {
            vi.useRealTimers();
        }
    });

    it('displays error message when onConfirm throws', async () => {
        const errorMessage = 'Test error message';
        const failingConfirm = vi.fn().mockRejectedValue(new Error(errorMessage));

        render(
            <MockTheme>
                <ConfirmationDialog opened onConfirm={failingConfirm} onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('renders custom cancel button when provided', () => {
        const customCancelButton = <Button>Custom Cancel</Button>;

        render(
            <MockTheme>
                <ConfirmationDialog opened cancelButton={customCancelButton} onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Custom Cancel' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('renders custom confirm button when provided', () => {
        const customConfirmButton = <Button>Custom Confirm</Button>;

        render(
            <MockTheme>
                <ConfirmationDialog
                    opened
                    confirmButton={customConfirmButton}
                    onConfirm={onConfirm}
                    onClose={onClose}
                />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Custom Confirm' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
    });

    it('renders custom actions when provided', () => {
        const customActions = <details>Custom Actions</details>;

        render(
            <MockTheme>
                <ConfirmationDialog opened actions={customActions} onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.getByRole('group')).toHaveTextContent('Custom Actions');
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
    });

    it('calls onClose when custom cancel button is clicked', async () => {
        const customCancelButton = <Button>Custom Cancel</Button>;

        render(
            <MockTheme>
                <ConfirmationDialog opened cancelButton={customCancelButton} onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        const target = screen.getByRole('button', { name: 'Custom Cancel' });
        await user.click(target);

        expect(onClose).toHaveBeenCalledWith(expectEvent('click', { target }));
    });

    it('calls onConfirm when custom confirm button is clicked', async () => {
        const customConfirmButton = <Button>Custom Confirm</Button>;

        render(
            <MockTheme>
                <ConfirmationDialog
                    opened
                    confirmButton={customConfirmButton}
                    onConfirm={onConfirm}
                    onClose={onClose}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Custom Confirm' }));

        expect(onConfirm).toHaveBeenCalledWith(expect.any(Object));
        expect(onClose).toHaveBeenCalledWith();
    });
});
