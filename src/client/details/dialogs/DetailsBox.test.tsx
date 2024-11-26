import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useMoveDetails } from '~/state/details/useMoveDetails';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useAddDetails');
jest.mock('~/state/details/useDeleteDetails');
jest.mock('~/state/details/useMoveDetails');
jest.mock('~/state/details/useRenameDetails');
jest.mock('~/client/common/Label');

describe('DetailsBox', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        details: getDetailsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.resetAllMocks());

    it('renders with cancel button', () => {
        render(<DetailsBox onClose={onClose} />, withReduxState(state));
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(<DetailsBox onClose={onClose} />, withReduxState(state));
        expect(screen.getByText('Add new entry')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(<DetailsBox name="Avietės" onClose={onClose} />, withReduxState(state));
        expect(screen.getByText('Update entry')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveDisplayValue('Avietės');
    });

    it('renders with group name', () => {
        render(<DetailsBox group="Uogienės" onClose={onClose} />, withReduxState(state));
        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveDisplayValue('Uogienės');
    });

    it('calls onClose when close button is clicked', async () => {
        render(<DetailsBox onClose={onClose} />, withReduxState(state));
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        const addDetails = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            (useAddDetails as jest.Mock).mockReturnValue(addDetails.mockResolvedValue(true));
            render(<DetailsBox group="Uogienės" onClose={onClose} />, withReduxState(state));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            (useAddDetails as jest.Mock).mockReturnValue(addDetails.mockRejectedValueOnce('Failed to add'));
            render(<DetailsBox group="Uogienės" onClose={onClose} />, withReduxState(state));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            (useAddDetails as jest.Mock).mockReturnValue(addDetails);
            render(<DetailsBox group="Uogienės" onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            (useAddDetails as jest.Mock).mockReturnValue(addDetails);
            render(<DetailsBox group="Uogienės" onClose={onClose} />, withReduxState(state));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Avietės');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('This name already exists');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        const renameDetails = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails.mockResolvedValueOnce(true));
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails.mockRejectedValueOnce('Failed to rename'));
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(
                <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />,
                withReduxState({ details: getDetailsFixture() })
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Braškės');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('This name already exists');
        });

        it('closes without updating when name was not changed', async () => {
            (useRenameDetails as jest.Mock).mockReturnValue(renameDetails);
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });

    describe('calls move details handle when changing entry group', () => {
        const moveDetails = jest.fn();

        it('closes dialog without error when successfully moved', async () => {
            (useMoveDetails as jest.Mock).mockReturnValue(moveDetails.mockResolvedValueOnce(true));
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Move' }));
            expect(moveDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Avietės');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            (useMoveDetails as jest.Mock).mockReturnValue(moveDetails.mockRejectedValueOnce('Failed to rename'));
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Move' }));
            expect(moveDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            (useMoveDetails as jest.Mock).mockReturnValue(moveDetails);
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.click(screen.getByRole('button', { name: 'Move' }));
            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            (useMoveDetails as jest.Mock).mockReturnValue(moveDetails);
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agurkai');
            await userEvent.click(screen.getByRole('button', { name: 'Move' }));
            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('This name already exists');
        });

        it('closes without updating when group was not changed', async () => {
            (useMoveDetails as jest.Mock).mockReturnValue(moveDetails);
            render(<DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });
});
