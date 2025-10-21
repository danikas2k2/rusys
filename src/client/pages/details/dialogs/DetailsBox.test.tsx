import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { DetailsBox } from '~/client/pages/details/dialogs/DetailsBox';
import { useAddDetails } from '~/client/state/details/useAddDetails';
import { useMoveDetails } from '~/client/state/details/useMoveDetails';
import { useRenameDetails } from '~/client/state/details/useRenameDetails';

jest.mock('~/client/state/details/useAddDetails');
jest.mock('~/client/state/details/useDeleteDetails');
jest.mock('~/client/state/details/useMoveDetails');
jest.mock('~/client/state/details/useRenameDetails');
jest.mock('~/client/common/Label');

describe('<DetailsBox>', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        details: getDetailsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.resetAllMocks());

    it('renders with cancel button', () => {
        render(
            <MockRedux state={state}>
                <DetailsBox onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockRedux state={state}>
                <DetailsBox onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByText('Add new entry')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockRedux state={state}>
                <DetailsBox name="Avietės" onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByText('Update entry')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveDisplayValue('Avietės');
    });

    it('renders with group name', () => {
        render(
            <MockRedux state={state}>
                <DetailsBox group="Uogienės" onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveDisplayValue('Uogienės');
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockRedux state={state}>
                <DetailsBox onClose={onClose} />
            </MockRedux>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        const addDetails = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails.mockResolvedValue(true));
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails.mockRejectedValueOnce('Failed to add'));
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" onClose={onClose} />
                </MockRedux>
            );
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
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails.mockResolvedValueOnce(true));
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails.mockRejectedValueOnce('Failed to rename'));
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Title' }));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails);
            render(
                <MockRedux state={{ details: getDetailsFixture() }}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
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
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });

    describe('calls move details handle when changing entry group', () => {
        const moveDetails = jest.fn();

        it('closes dialog without error when successfully moved', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails.mockResolvedValueOnce(true));
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Avietės');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails.mockRejectedValueOnce('Failed to rename'));
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
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
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
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
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails);
            render(
                <MockRedux state={state}>
                    <DetailsBox group="Uogienės" name="Avietės" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });
});
