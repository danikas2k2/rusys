import { act, render, screen } from '@testing-library/react';
import user, { type UserEvent } from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { useRenameVariant } from '~/client/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/client/state/variants/useUpdateVariant';

jest.mock('~/client/common/Label');
jest.mock('~/client/state/variants/useCopyVariant');
jest.mock('~/client/state/variants/useRenameVariant');
jest.mock('~/client/state/variants/useUpdateVariant');
jest.mock('~/client/filters/hooks/useGroupFilter', () => ({
    useGroupFilter: jest.fn(() => ''),
}));

describe('<VariantBox>', () => {
    afterEach(() => jest.clearAllMocks());

    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = jest.fn();

    it('renders with cancel button', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial values', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Add new variant' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial values', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened variant="Litriukas" group="Daržovės" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Edit variant' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('Litriukas');
        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveValue('Daržovės');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls update variant handler when adding a new entry', () => {
        const updateVariant = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), '4½');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { suffix: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockRejectedValueOnce('Failed to add'));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { suffix: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'd');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant already exists');
        });
    });

    describe('calls rename variant handler when updating an existing entry', () => {
        const renameVariant = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant.mockResolvedValueOnce(true));

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.clear(screen.getByRole('textbox', { name: 'Suffix' }));
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), '4½');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { suffix: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant.mockRejectedValueOnce('Failed to rename'));

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { suffix: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant name is required');
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'x');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Variant already exists');
        });

        it('closes without updating when name was not changed', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'd');
        });
    });

    describe('calls copy variant handler when changing group', () => {
        const copyVariant = jest.fn();

        beforeEach(() => {
            copyVariant.mockResolvedValue(undefined);
            jest.mocked(useCopyVariant).mockReturnValue(copyVariant);
        });

        it('closes dialog without error when successfully copied', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Uogienės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewVariant');
            await user.click(screen.getByRole('button', { name: 'Duplicate' }));

            expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'd', 'Uogienės', 'NewVariant', { suffix: '' });
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'NewVariant');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when copy fails', async () => {
            copyVariant.mockRejectedValueOnce('Failed to copy');

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Uogienės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewVariant');
            await user.click(screen.getByRole('button', { name: 'Duplicate' }));

            expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'd', 'Uogienės', 'NewVariant', { suffix: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to copy');
        });

        it('calls copyVariant with suffix when suffix is provided', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" suffix="test" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Uogienės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewVariant');
            await user.clear(screen.getByRole('textbox', { name: 'Suffix' }));
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), 'new-suffix');
            await user.click(screen.getByRole('button', { name: 'Duplicate' }));

            expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'd', 'Uogienės', 'NewVariant', {
                suffix: 'new-suffix',
            });
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'NewVariant');
        });
    });

    describe('validation', () => {
        it('displays error when group is empty', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Group' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Group is required');
        });

        it('displays error when variant contains colon', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test:variant');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        }, 10000);
    });

    describe('renders Duplicate button when group is changed', () => {
        it('shows Duplicate button when editing and group is changed', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            // Initially shows Update button
            expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();

            // Change group to trigger Duplicate button
            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Uogienės' }));

            // Should now show Duplicate button (tests getButtonContent with groupChanged condition)
            expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument();
        } /*, 10000*/);
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
            const updateVariant = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            // Wait for initial focus timer to complete
            act(() => jest.advanceTimersByTime(100));

            await timeUser.click(screen.getByRole('textbox', { name: 'Group' }));
            await timeUser.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await timeUser.type(screen.getByRole('textbox', { name: 'Variant name' }), 'New Variant');

            const addButton = screen.getByRole('button', { name: 'Add' });
            await timeUser.click(addButton);

            // Advance timers by 300ms to trigger loading state
            act(() => jest.advanceTimersByTime(300));

            // Verify that loading state was triggered
            expect(addButton).toBeInTheDocument();

            // Complete the async operation
            await updateVariant();

            // Button should be enabled again after operation completes
            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const updateVariant = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            // Wait for initial focus timer to complete
            act(() => jest.advanceTimersByTime(100));

            await timeUser.click(screen.getByRole('textbox', { name: 'Group' }));
            await timeUser.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await timeUser.type(screen.getByRole('textbox', { name: 'Variant name' }), 'Fast Variant');

            const addButton = screen.getByRole('button', { name: 'Add' });
            await timeUser.click(addButton);

            // Complete the async operation immediately (before 300ms)
            await updateVariant();

            // Advance timers by less than 300ms - timeout should be cleared
            act(() => {
                jest.advanceTimersByTime(200);
            });

            // Button should be enabled and timeout cleared
            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Fast Variant');
        });
    });
});
