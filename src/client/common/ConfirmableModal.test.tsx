import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';

vi.mock(import('~/client/common/Label'));

describe('<ConfirmableModal>', () => {
    const onClose = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('renders the modal content via the render prop', () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                    {() => <div>Modal content</div>}
                </ConfirmableModal>
            </MockTheme>
        );

        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('closes without confirmation when not dirty', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).toHaveBeenCalledWith();
        expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
    });

    it('asks for confirmation instead of closing when dirty', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => true} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    });

    it('closes after confirming discard', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => true} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(screen.getByRole('button', { name: 'Discard' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('keeps the modal open when cancelling the discard confirmation', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => true} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('scrolls a focused input into view after the keyboard has time to animate in', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const scrollIntoView = vi.fn();
        HTMLElement.prototype.scrollIntoView = scrollIntoView;

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <input aria-label="Name" />}
                    </ConfirmableModal>
                </MockTheme>
            );

            const input = screen.getByRole('textbox', { name: 'Name' });
            await user.click(input);

            expect(scrollIntoView).not.toHaveBeenCalled();

            vi.advanceTimersByTime(300);

            expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not scroll on focus for non-input elements', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const scrollIntoView = vi.fn();
        HTMLElement.prototype.scrollIntoView = scrollIntoView;

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <button type="button">Focus me</button>}
                    </ConfirmableModal>
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Focus me' }));
            vi.advanceTimersByTime(300);

            expect(scrollIntoView).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it('guards escape/click-outside/header-close through the same handleClose', async () => {
        render(
            <MockTheme>
                <ConfirmableModal
                    opened
                    isDirty={() => true}
                    onClose={onClose}
                    withCloseButton
                    closeButtonProps={{ 'aria-label': 'Close' }}
                >
                    {() => <div>Modal content</div>}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    });
});
