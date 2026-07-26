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
