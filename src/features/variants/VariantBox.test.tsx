import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useUpdateGroup } from '~/features/groups/hooks/useUpdateGroup';
import { useCopyVariant } from '~/features/variants/hooks/useCopyVariant';
import { useRenameVariant } from '~/features/variants/hooks/useRenameVariant';
import { useUpdateVariant } from '~/features/variants/hooks/useUpdateVariant';
import { VariantBox } from '~/features/variants/VariantBox';

vi.mock(import('~/components/common/Label'));
vi.mock(import('~/features/variants/hooks/useCopyVariant'));
vi.mock(import('~/features/variants/hooks/useRenameVariant'));
vi.mock(import('~/features/variants/hooks/useUpdateVariant'));
vi.mock(import('~/features/groups/hooks/useUpdateGroup'));
vi.mock(import('~/features/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));

async function selectOption(name: string) {
    const combobox = screen.getByRole('combobox', { name: 'Category' });
    act(() => fireEvent.click(combobox));
    await selectUser.click(await screen.findByRole('option', { name }));
}

let user: UserEvent;
let selectUser: UserEvent;

describe('<VariantBox>', () => {
    beforeEach(() => {
        user = userEvent.setup({ delay: null });
        selectUser = userEvent.setup();
        vi.mocked(useGroupFilter).mockReturnValue(['', vi.fn()]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = vi.fn();

    it('does not render when opened=false', () => {
        render(
            <MockApp state={state}>
                <VariantBox onClose={onClose} />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('leaves the name field blank when the variant name is just the auto-derived count+units key', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened group="Daržovės" variant="500ml" count={500} units="ml" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('');
    });

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
        expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    describe('inline category creation', () => {
        it('creates and selects a new category', async () => {
            const updateGroup = vi.fn().mockResolvedValue(true);
            const updateVariant = vi.fn().mockResolvedValue(true);
            vi.mocked(useUpdateGroup).mockReturnValue(updateGroup);
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('New category');
            const categoryDialog = screen
                .getByRole('textbox', { name: 'Category name' })
                .closest('[role="dialog"]') as HTMLElement;
            await user.type(within(categoryDialog).getByRole('textbox', { name: 'Category name' }), 'Konservai');
            await user.click(within(categoryDialog).getByRole('button', { name: 'Add' }));

            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'Didelis');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateGroup).toHaveBeenCalledWith('Konservai', true, false, '');
            expect(updateVariant).toHaveBeenCalledWith('Konservai', 'Didelis', { suffix: '' });
        });
    });

    it('uses filterGroup when no initial group is provided', () => {
        vi.mocked(useGroupFilter).mockReturnValue(['Daržovės', vi.fn()]);

        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('Daržovės');
    });

    it('shows Duplicate button when editing and filterGroup differs from initialGroup', () => {
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);

        render(
            <MockApp state={state}>
                <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument();
    });

    it('renders with initial values', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened variant="Litriukas" group="Daržovės" count={1} units="l" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Edit variant' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('Litriukas');
        expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('Daržovės');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('shows removal only while editing and calls its handler', async () => {
        const onDelete = vi.fn();
        const { rerender } = render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} onDelete={onDelete} />
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();

        rerender(
            <MockApp state={state}>
                <VariantBox opened group="Daržovės" variant="d" onClose={onClose} onDelete={onDelete} />
            </MockApp>
        );
        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(onDelete).toHaveBeenCalledTimes(1);
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

    describe('discard confirmation', () => {
        it('closes without confirmation when the form is untouched', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).toHaveBeenCalledWith();
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when the form was changed', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            await expect(screen.findByRole('button', { name: 'Discard' })).resolves.toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(await screen.findByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledWith();
        });

        it('keeps the dialog open when cancelling the discard confirmation', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('test');
        });
    });

    describe('calls update variant handler when adding a new entry', () => {
        const updateVariant = vi.fn();

        it('closes dialog without error when successfully added', async () => {
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), '4½');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { suffix: '4½', count: 500, units: 'vnt' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockRejectedValueOnce('Failed to add'));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { suffix: '', count: 500, units: 'vnt' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name and count fields left', async () => {
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveAttribute('aria-invalid', 'true');
            expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true');
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'd');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant already exists');
        });
    });

    describe('calls rename variant handler when updating an existing entry', () => {
        const renameVariant = vi.fn();

        it('closes dialog without error when successfully renamed', async () => {
            vi.mocked(useRenameVariant).mockReturnValue(renameVariant.mockResolvedValueOnce(true));

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.clear(screen.getByRole('textbox', { name: 'Suffix' }));
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), '4½');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', {
                suffix: '4½',
                count: 500,
                units: 'ml',
            });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            vi.mocked(useRenameVariant).mockReturnValue(renameVariant.mockRejectedValueOnce('Failed to rename'));

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', {
                suffix: '',
                count: 500,
                units: 'ml',
            });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when both name and amount are cleared', async () => {
            vi.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.clear(screen.getByRole('textbox', { name: 'Amount' }));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
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
            vi.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'd');
        });
    });

    describe('calls copy variant handler when changing group', () => {
        const copyVariant = vi.fn();

        beforeEach(() => {
            copyVariant.mockResolvedValue(undefined);
            vi.mocked(useCopyVariant).mockReturnValue(copyVariant);
        });

        it('closes dialog without error when successfully copied', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            await selectOption('Uogienės');
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewVariant');
            await user.click(screen.getByRole('button', { name: 'Duplicate' }));

            expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'd', 'Uogienės', 'NewVariant', {
                suffix: '',
                count: 500,
                units: 'ml',
            });
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'NewVariant');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when copy fails', async () => {
            copyVariant.mockRejectedValueOnce('Failed to copy');

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            await selectOption('Uogienės');
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewVariant');
            await user.click(screen.getByRole('button', { name: 'Duplicate' }));

            expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'd', 'Uogienės', 'NewVariant', {
                suffix: '',
                count: 500,
                units: 'ml',
            });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to copy');
        });

        it('calls copyVariant with suffix when suffix is provided', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox
                        opened
                        group="Daržovės"
                        variant="d"
                        suffix="test"
                        count={500}
                        units="ml"
                        onClose={onClose}
                    />
                </MockApp>
            );

            await selectOption('Uogienės');
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewVariant');
            await user.clear(screen.getByRole('textbox', { name: 'Suffix' }));
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), 'new-suffix');
            await user.click(screen.getByRole('button', { name: 'Duplicate' }));

            expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'd', 'Uogienės', 'NewVariant', {
                suffix: 'new-suffix',
                count: 500,
                units: 'ml',
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
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('combobox', { name: 'Category' })).toHaveAttribute('aria-invalid', 'true');
            expect(screen.getByRole('alert')).toHaveTextContent('Category is required');
        });

        it('displays error when variant contains colon', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test:variant');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });

        it('does not mark amount as invalid when it is cleared after being filled while name is present', async () => {
            const updateVariant = vi.fn().mockResolvedValue(true);
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'NewOne');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.clear(screen.getByRole('textbox', { name: 'Amount' }));

            expect(screen.getByRole('textbox', { name: 'Amount' })).not.toHaveAttribute('aria-invalid', 'true');

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', 'NewOne', { suffix: '' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'NewOne');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not mark name as invalid when amount is provided without a name', async () => {
            const updateVariant = vi.fn().mockResolvedValue(true);
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '750');

            expect(screen.getByRole('textbox', { name: 'Variant name' })).not.toHaveAttribute('aria-invalid', 'true');

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '750vnt', { suffix: '', count: 750, units: 'vnt' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '750vnt');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays errors on both fields when both name and amount are left empty', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveAttribute('aria-invalid', 'true');
            expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true');
        });

        it('accepts submission when both name and amount are filled in', async () => {
            const updateVariant = vi.fn().mockResolvedValue(true);
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'BothFilled');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');

            expect(screen.getByRole('textbox', { name: 'Variant name' })).not.toHaveAttribute('aria-invalid', 'true');
            expect(screen.getByRole('textbox', { name: 'Amount' })).not.toHaveAttribute('aria-invalid', 'true');

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', 'BothFilled', {
                suffix: '',
                count: 500,
                units: 'vnt',
            });
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'BothFilled');
        });
    });

    describe('renders Duplicate button when group is changed', () => {
        it('shows Duplicate button when editing and group is changed', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" count={500} units="ml" onClose={onClose} />
                </MockApp>
            );

            // Initially shows Update button
            expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();

            // Change group to trigger Duplicate button
            await selectOption('Uogienės');

            // Should now show Duplicate button (tests getButtonContent with groupChanged condition)
            expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument();
        });
    });

    describe('loading state with fake timers', () => {
        let resolveUpdate: () => void;

        afterEach(() => vi.useRealTimers());

        it('shows loading state after 300ms delay when submitting form', async () => {
            const updateVariant = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveUpdate = resolve;
                    })
            );
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'New Variant');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');

            const addButton = screen.getByRole('button', { name: 'Add' });
            vi.useFakeTimers();
            act(() => fireEvent.click(addButton));

            expect(addButton).toBeDisabled();
            expect(within(addButton).queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();

            // Advance timers by 300ms to trigger loading state
            await act(() => vi.advanceTimersByTimeAsync(300));

            expect(within(addButton).getByRole('progressbar', { hidden: true })).toBeInTheDocument();

            // Complete the async operation and flush microtasks
            await act(async () => {
                resolveUpdate();
                await vi.runAllTimersAsync();
            });

            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const updateVariant = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveUpdate = resolve;
                    })
            );
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'Fast Variant');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');

            const addButton = screen.getByRole('button', { name: 'Add' });
            vi.useFakeTimers();
            act(() => fireEvent.click(addButton));

            // Complete the async operation immediately (before 300ms)
            await act(() => {
                resolveUpdate();
            });

            // Advance timers by less than 300ms — timeout already cleared, no loading state
            await act(() => vi.advanceTimersByTimeAsync(200));

            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Fast Variant');
        });
    });
});
