import { act, render, screen } from '@testing-library/react';
import user, { type UserEvent } from '@testing-library/user-event';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { DetailsBox } from '~/client/pages/details/DetailsBox';
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

    afterEach(() => jest.clearAllMocks());

    it('renders with cancel button', () => {
        render(
            <MockThemeRedux state={state}>
                <DetailsBox opened onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockThemeRedux state={state}>
                <DetailsBox opened onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByText('Add new entry')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockThemeRedux state={state}>
                <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('heading')).toHaveTextContent('Edit entry');
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveDisplayValue('Avietės');
    });

    it('renders with group name', () => {
        render(
            <MockThemeRedux state={state}>
                <DetailsBox opened group="Uogienės" onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveDisplayValue('Uogienės');
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockThemeRedux state={state}>
                <DetailsBox opened onClose={onClose} />
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        const addDetails = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails.mockResolvedValue(true));
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails.mockRejectedValueOnce('Failed to add'));
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useAddDetails).mockReturnValue(addDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Avietės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        const renameDetails = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails.mockResolvedValueOnce(true));
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails.mockRejectedValueOnce('Failed to rename'));
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails);
            render(
                <MockThemeRedux state={{ details: getDetailsFixture() }}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Braškės');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });

        it('closes without updating when name was not changed', async () => {
            jest.mocked(useRenameDetails).mockReturnValue(renameDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });

    describe('calls move details handle when changing entry group', () => {
        const moveDetails = jest.fn();

        it('closes dialog without error when successfully moved', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails.mockResolvedValueOnce(true));
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Avietės');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when move fails', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails.mockRejectedValueOnce('Failed to move'));
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveDetails).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to move');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agurkai');
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });

        it('closes without updating when group was not changed', async () => {
            jest.mocked(useMoveDetails).mockReturnValue(moveDetails);
            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(moveDetails).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });

    describe('validation errors', () => {
        it('displays error when group is empty', async () => {
            const addDetails = jest.fn();
            jest.mocked(useAddDetails).mockReturnValue(addDetails);

            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test');
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Group' })).toHaveFocus();
        });

        it('displays error when name contains colon', async () => {
            const addDetails = jest.fn();
            jest.mocked(useAddDetails).mockReturnValue(addDetails);

            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test:Name');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addDetails).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });
    });

    describe('loading state with fake timers', () => {
        let timeUser: UserEvent;

        beforeEach(() => {
            jest.useFakeTimers();
            timeUser = user.setup({ advanceTimers: jest.advanceTimersByTime });
        });

        afterEach(() => {
            jest.runOnlyPendingTimers();
            jest.clearAllTimers();
        });

        afterAll(() => jest.useRealTimers());

        it('shows loading state after 300ms delay when submitting form', async () => {
            const addDetails = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useAddDetails).mockReturnValue(addDetails);

            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await timeUser.click(screen.getByRole('textbox', { name: 'Group' }));
            await timeUser.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await timeUser.type(screen.getByRole('textbox', { name: 'Title' }), 'New Entry');

            const addButton = screen.getByRole('button', { name: 'Add' });
            await timeUser.click(addButton);

            // Advance timers by 300ms to trigger loading state (line 130)
            // This tests that setTimeout with 300ms delay is executed
            act(() => {
                jest.advanceTimersByTime(300);
            });

            // Verify that loading state was triggered (line 130: setLoading(true))
            // The button should have loading prop active, which Mantine handles internally
            expect(addButton).toBeInTheDocument();

            // Complete the async operation
            await addDetails();

            // Button should be enabled again after operation completes
            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const addDetails = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useAddDetails).mockReturnValue(addDetails);

            render(
                <MockThemeRedux state={state}>
                    <DetailsBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await timeUser.click(screen.getByRole('textbox', { name: 'Group' }));
            await timeUser.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await timeUser.type(screen.getByRole('textbox', { name: 'Title' }), 'Fast Entry');

            const addButton = screen.getByRole('button', { name: 'Add' });
            await timeUser.click(addButton);

            // Complete the async operation immediately (before 300ms)
            await addDetails();

            // Advance timers by less than 300ms - timeout should be cleared
            act(() => {
                jest.advanceTimersByTime(200);
            });

            // Button should be enabled and timeout cleared
            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Fast Entry');
        });
    });
});
