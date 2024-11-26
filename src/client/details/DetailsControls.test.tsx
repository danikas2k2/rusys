import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DetailsControls } from '~/client/details/DetailsControls';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useDeleteDetails');

describe('DetailControls', () => {
    const onPin = jest.fn();
    const onUnpin = jest.fn();
    const deleteDetails = jest.fn();

    beforeEach(() => {
        (useDeleteDetails as jest.Mock).mockReturnValue(deleteDetails);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders edit and remove buttons', () => {
        render(<DetailsControls group="Uogienės" name="Avietės" />, withReduxState());
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('opens dialog when edit button is clicked', async () => {
        render(<DetailsControls group="Uogienės" name="Avietės" onPin={onPin} onUnpin={onUnpin} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
    });

    it('unpin controls when dialog is closed', async () => {
        render(<DetailsControls group="Uogienės" name="Avietės" onPin={onPin} onUnpin={onUnpin} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onUnpin).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(onUnpin).toHaveBeenCalledWith();
    });

    it('calls deleteDetails and onUnpin when remove button is confirmed', async () => {
        render(<DetailsControls group="Uogienės" name="Avietės" onPin={onPin} onUnpin={onUnpin} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(onPin).toHaveBeenCalled();
        expect(onUnpin).not.toHaveBeenCalled();
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
        expect(deleteDetails).toHaveBeenCalledWith('Uogienės', 'Avietės');
        expect(onUnpin).toHaveBeenCalledWith(true);
    });
});
