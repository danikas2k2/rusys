import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { getDetailsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useAddDetails');
jest.mock('~/state/details/useDeleteDetails');
jest.mock('~/state/details/useRenameDetails');

describe('EditBox', () => {
    it('renders group name', () => {
        const onClose = jest.fn();
        render(<DetailsBox group="Group" onClose={onClose} />, withReduxState());
        expect(screen.getByText('Group')).toBeInTheDocument();
    });

    it('renders initial name', () => {
        const onClose = jest.fn();
        render(<DetailsBox name="Initial" onClose={onClose} />, withReduxState());
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveDisplayValue('Initial');
    });

    it('calls onClose when close button is clicked', async () => {
        const onClose = jest.fn();
        render(<DetailsBox onClose={onClose} />, withReduxState());
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        it('closes dialog without error when successfully added', async () => {
            const onClose = jest.fn();
            const addDetails = jest.fn().mockResolvedValue(true);
            (useAddDetails as jest.Mock).mockReturnValue(addDetails);
            render(<DetailsBox group="Group" onClose={onClose} />, withReduxState());
            await userEvent.type(screen.getByRole('textbox'), 'Added');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).toHaveBeenCalledWith('Group', 'Added');
            expect(onClose).toHaveBeenCalledWith('Group', 'Added');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            const onClose = jest.fn();
            const addDetails = jest.fn().mockRejectedValueOnce('Failed to add');
            (useAddDetails as jest.Mock).mockReturnValue(addDetails);
            render(<DetailsBox group="Group" onClose={onClose} />, withReduxState());
            await userEvent.type(screen.getByRole('textbox'), 'Added');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).toHaveBeenCalledWith('Group', 'Added');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            const onClose = jest.fn();
            const addDetails = jest.fn();
            (useAddDetails as jest.Mock).mockReturnValue(addDetails);
            render(<DetailsBox group="Group" onClose={onClose} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            const onClose = jest.fn();
            const addDetails = jest.fn();
            (useAddDetails as jest.Mock).mockReturnValue(addDetails);
            render(<DetailsBox group="G" onClose={onClose} />, withReduxState({ details: getDetailsFixture() }));
            await userEvent.type(screen.getByRole('textbox'), 'A');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('This name already exists');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        it('closes dialog without error when successfully renamed', async () => {
            const onClose = jest.fn();
            const renameDetails = jest.fn().mockResolvedValueOnce(true);
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.type(screen.getByRole('textbox'), 'Updated');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).toHaveBeenCalledWith('Group', 'Existing', 'Updated');
            expect(onClose).toHaveBeenCalledWith('Group', 'Updated');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            const onClose = jest.fn();
            const renameDetails = jest.fn().mockRejectedValueOnce('Failed to rename');
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.type(screen.getByRole('textbox'), 'Updated');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).toHaveBeenCalledWith('Group', 'Existing', 'Updated');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            const onClose = jest.fn();
            const renameDetails = jest.fn();
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="G" name="C" onClose={onClose} />, withReduxState());
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            const onClose = jest.fn();
            const renameDetails = jest.fn();
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="G" name="A" onClose={onClose} />, withReduxState({ details: getDetailsFixture() }));
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.type(screen.getByRole('textbox'), 'C');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('This name already exists');
        });

        it('closes without updating when name was not changed', async () => {
            const onClose = jest.fn();
            const renameDetails = jest.fn();
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Group', 'Existing');
        });
    });

    describe('calls remove details handle when removing an existing entry', () => {
        it('displays confirmation, does nothing when closed', async () => {
            const onClose = jest.fn();
            const removeDetails = jest.fn().mockResolvedValueOnce(true);
            (useDeleteDetails as jest.Mock).mockReturnValue(removeDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

            const dialog = screen.getByRole('alertdialog');
            expect(dialog).toBeInTheDocument();
            expect(dialog).toHaveTextContent('Sure to remove?');
            await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

            expect(removeDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays confirmation, does nothing when canceled', async () => {
            const onClose = jest.fn();
            const removeDetails = jest.fn().mockResolvedValueOnce(true);
            (useDeleteDetails as jest.Mock).mockReturnValue(removeDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
            expect(removeDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays confirmation, calls handler and closes dialog when confirmed', async () => {
            const onClose = jest.fn();
            const removeDetails = jest.fn().mockResolvedValueOnce(true);
            (useDeleteDetails as jest.Mock).mockReturnValue(removeDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
            expect(removeDetails).toHaveBeenCalledWith('Group', 'Existing');
            expect(onClose).toHaveBeenCalledWith('Group', 'Existing');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when remove fails', async () => {
            const onClose = jest.fn();
            const removeDetails = jest.fn().mockRejectedValueOnce('Failed to remove');
            (useDeleteDetails as jest.Mock).mockReturnValue(removeDetails);
            render(<DetailsBox group="Group" name="Existing" onClose={onClose} />, withReduxState());
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
            expect(removeDetails).toHaveBeenCalledWith('Group', 'Existing');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to remove');
        });
    });
});
