import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { VariantControls } from '~/client/variants/VariantControls';
import { useDeleteVariant } from '~/state/variants/useDeleteVariant';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/variants/useDeleteVariant');

describe('VariantControls', () => {
    const onPin = jest.fn();
    const onUnpin = jest.fn();
    const deleteVariant = jest.fn();

    beforeEach(() => {
        (useDeleteVariant as jest.Mock).mockReturnValue(deleteVariant);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders edit and remove buttons', () => {
        render(<VariantControls group="Uogienės" variant="Puslitris" />, withReduxState());
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('opens dialog when edit button is clicked', async () => {
        render(
            <VariantControls group="Uogienės" variant="Puslitris" onPin={onPin} onUnpin={onUnpin} />,
            withReduxState()
        );
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
    });

    it('unpin controls when dialog is closed', async () => {
        render(
            <VariantControls group="Uogienės" variant="Puslitris" onPin={onPin} onUnpin={onUnpin} />,
            withReduxState()
        );
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onUnpin).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(onUnpin).toHaveBeenCalledWith();
    });

    it('calls deleteVariant and onUnpin when remove button is confirmed', async () => {
        render(
            <VariantControls group="Uogienės" variant="Puslitris" onPin={onPin} onUnpin={onUnpin} />,
            withReduxState()
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
        expect(deleteVariant).toHaveBeenCalledWith('Uogienės', 'Puslitris');
        expect(onUnpin).toHaveBeenCalledWith(true);
    });
});
