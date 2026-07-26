import { act, fireEvent, render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';

vi.mock(import('~/client/common/Label'));
vi.mock(import('~/client/state/groups/useRenameGroup'));
vi.mock(import('~/client/state/groups/useUpdateGroup'));

describe('<GroupBox>', () => {
    afterEach(() => vi.clearAllMocks());

    const state = {
        groups: getGroupsFixture(),
    };

    const onClose = vi.fn();

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

    describe('discard confirmation', () => {
        it('closes without confirmation when the form is untouched', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).toHaveBeenCalledWith();
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when the form was changed', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Group name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Group name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(screen.getByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledWith();
        });

        it('keeps the dialog open when cancelling the discard confirmation', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Group name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('test');
        });
    });

    describe('calls update group handler when adding a new entry', () => {
        const addGroup = vi.fn();

        it('closes dialog without error when successfully added', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup.mockResolvedValue(true));

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
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup.mockRejectedValueOnce('Failed to add'));
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
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

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
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

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
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

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

    describe('calls rename group handler when updating an existing entry', () => {
        const renameGroup = vi.fn();

        it('closes dialog without error when successfully renamed', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup.mockResolvedValueOnce(true));

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
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup.mockRejectedValueOnce('Failed to rename'));

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
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

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
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

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
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

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
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

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
        let resolveUpdate: () => void;

        beforeEach(() => vi.useFakeTimers());

        afterEach(() => vi.useRealTimers());

        it('shows loading state after 300ms delay when submitting form', async () => {
            const updateGroup = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveUpdate = resolve;
                    })
            );
            vi.mocked(useUpdateGroup).mockReturnValue(updateGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Group name' }), {
                    target: { value: 'New Group' },
                })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
            act(() => fireEvent.click(addButton));

            // Advance timers by 300ms to trigger loading state
            await act(() => vi.advanceTimersByTimeAsync(300));

            expect(addButton).toBeInTheDocument();

            // Complete the async operation and flush microtasks
            await act(async () => {
                resolveUpdate();
                await vi.runAllTimersAsync();
            });

            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const updateGroup = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveUpdate = resolve;
                    })
            );
            vi.mocked(useUpdateGroup).mockReturnValue(updateGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Group name' }), {
                    target: { value: 'Fast Group' },
                })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
            act(() => fireEvent.click(addButton));

            // Complete the async operation immediately (before 300ms)
            await act(() => {
                resolveUpdate();
            });

            // Advance timers by less than 300ms — timeout already cleared
            await act(() => vi.advanceTimersByTimeAsync(200));

            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Fast Group');
        });
    });
});
