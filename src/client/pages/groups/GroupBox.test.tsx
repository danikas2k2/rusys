import { act, render, screen } from '@testing-library/react';
import user, { type UserEvent } from '@testing-library/user-event';
import { getGroupsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';

jest.mock('~/client/common/Label');
jest.mock('~/client/state/groups/useRenameGroup');
jest.mock('~/client/state/groups/useUpdateGroup');

describe('<GroupBox>', () => {
    afterEach(() => jest.clearAllMocks());

    const state = {
        groups: getGroupsFixture(),
    };

    const onClose = jest.fn();

    it('renders with cancel button', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByText('Add new group')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened group="Initial Group" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByText('Edit group')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('Initial Group');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        const addGroup = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useUpdateGroup).mockReturnValue(addGroup.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Buitinė chemija');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija', true);
            expect(onClose).toHaveBeenCalledWith('Buitinė chemija');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useUpdateGroup).mockReturnValue(addGroup.mockRejectedValueOnce('Failed to add'));
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );
            await user.type(screen.getByRole('textbox', { name: 'Group name' }), 'Buitinė chemija');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija', true);
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Uogienės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Group already exists');
        });

        it('displays error without closing dialog when name contains colon', async () => {
            jest.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Group:Name');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        const renameGroup = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup.mockResolvedValueOnce(true));

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Konservai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Konservai', true);
            expect(onClose).toHaveBeenCalledWith('Konservai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup.mockRejectedValueOnce('Failed to rename'));

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Konservai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Konservai', true);
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Uogienės');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Group already exists');
        });

        it('displays error without closing dialog when name contains colon', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Group:Name');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });

        it('closes without updating when name was not changed', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės');
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
            const updateGroup = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useUpdateGroup).mockReturnValue(updateGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            // Wait for initial focus timer to complete
            act(() => jest.advanceTimersByTime(100));

            await timeUser.type(screen.getByRole('textbox', { name: 'Group name' }), 'New Group');
            await timeUser.click(screen.getByRole('button', { name: 'Add' }));
            const addButton = screen.getByRole('button', { name: 'Add' });

            // Advance timers by 300ms to trigger loading state
            act(() => jest.advanceTimersByTime(300));

            // Verify that loading state was triggered
            expect(addButton).toBeInTheDocument();

            // Complete the async operation
            await updateGroup();

            // Button should be enabled again after operation completes
            expect(addButton).toBeInTheDocument();
        });
    });
});
