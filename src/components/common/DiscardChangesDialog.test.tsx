import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { DiscardChangesDialog } from '~/components/common/DiscardChangesDialog';

vi.mock(import('~/components/common/Label'));

describe('<DiscardChangesDialog>', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('does not render when not open', () => {
        render(
            <MockTheme>
                <DiscardChangesDialog opened={false} onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('renders the discard confirmation', () => {
        render(
            <MockTheme>
                <DiscardChangesDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        expect(screen.getByRole('alertdialog')).toHaveTextContent('Discard unsaved changes?');
    });

    it('calls onConfirm when discard button is clicked', async () => {
        render(
            <MockTheme>
                <DiscardChangesDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Discard' }));

        expect(onConfirm).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onClose when cancel button is clicked', async () => {
        render(
            <MockTheme>
                <DiscardChangesDialog opened onConfirm={onConfirm} onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).toHaveBeenCalledWith(expect.any(Object));
    });
});
