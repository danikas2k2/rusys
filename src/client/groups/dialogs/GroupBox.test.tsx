import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getGroupsFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { useAddGroup } from '~/state/groups/useAddGroup';
import { useRenameGroup } from '~/state/groups/useRenameGroup';

jest.mock('~/client/common/Label');
jest.mock('~/state/groups/useAddGroup');
jest.mock('~/state/groups/useRenameGroup');

describe('<GroupBox>', () => {
    const state = {
        groups: getGroupsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with cancel button', () => {
        render(<GroupBox onClose={onClose} />, withReduxState(state));

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(<GroupBox onClose={onClose} />, withReduxState(state));

        expect(screen.getByText('Add new group')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(<GroupBox group="Initial Group" onClose={onClose} />, withReduxState(state));

        expect(screen.getByText('Edit group')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('Initial Group');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(<GroupBox onClose={onClose} />, withReduxState(state));
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        const addGroup = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useAddGroup).mockReturnValue(addGroup.mockResolvedValue(true));
            render(<GroupBox onClose={onClose} />, withReduxState(state));
            await userEvent.type(screen.getByRole('textbox'), 'Buitinė chemija');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija');
            expect(onClose).toHaveBeenCalledWith('Buitinė chemija');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useAddGroup).mockReturnValue(addGroup.mockRejectedValueOnce('Failed to add'));
            render(<GroupBox onClose={onClose} />, withReduxState(state));
            await userEvent.type(screen.getByRole('textbox'), 'Buitinė chemija');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useAddGroup).mockReturnValue(addGroup);
            render(<GroupBox onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useAddGroup).mockReturnValue(addGroup);
            render(<GroupBox onClose={onClose} />, withReduxState(state));
            await userEvent.type(screen.getByRole('textbox'), 'Uogienės');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Group already exists');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        const renameGroup = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup.mockResolvedValueOnce(true));
            render(<GroupBox group="Daržovės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.type(screen.getByRole('textbox'), 'Konservai');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Konservai');
            expect(onClose).toHaveBeenCalledWith('Konservai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup.mockRejectedValueOnce('Failed to rename'));
            render(<GroupBox group="Daržovės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.type(screen.getByRole('textbox'), 'Konservai');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Konservai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);
            render(<GroupBox group="Daržovės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);
            render(<GroupBox group="Daržovės" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox'));
            await userEvent.type(screen.getByRole('textbox'), 'Uogienės');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Group already exists');
        });

        it('closes without updating when name was not changed', async () => {
            jest.mocked(useRenameGroup).mockReturnValue(renameGroup);
            render(<GroupBox group="Daržovės" onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės');
        });
    });
});
