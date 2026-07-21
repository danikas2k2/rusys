import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { useRenameVariant } from '~/client/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/client/state/variants/useUpdateVariant';

vi.mock(import('~/client/common/Label'));
vi.mock(import('~/client/state/variants/useCopyVariant'));
vi.mock(import('~/client/state/variants/useRenameVariant'));
vi.mock(import('~/client/state/variants/useUpdateVariant'));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));

function selectOption(name: string) {
    const combobox = screen.getByRole('combobox', { name: 'Group' });
    act(() => fireEvent.click(combobox));
    act(() => fireEvent.change(combobox, { target: { value: name } }));
    act(() => fireEvent.click(screen.getByRole('option', { name })));
}

describe('<VariantBox>', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({ delay: null });
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
        expect(screen.getByRole('combobox', { name: 'Group' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('uses filterGroup when no initial group is provided', () => {
        vi.mocked(useGroupFilter).mockReturnValue(['Daržovės', vi.fn()]);

        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('combobox', { name: 'Group' })).toHaveValue('Daržovės');
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
        expect(screen.getByRole('combobox', { name: 'Group' })).toHaveValue('Daržovės');
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
        const updateVariant = vi.fn();

        it('closes dialog without error when successfully added', async () => {
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            selectOption('Daržovės');
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

            selectOption('Daržovės');
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

            selectOption('Daržovės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveAttribute('aria-invalid', 'true');
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            selectOption('Daržovės');
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

            selectOption('Uogienės');
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

            selectOption('Uogienės');
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

            selectOption('Uogienės');
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
            expect(screen.getByRole('combobox', { name: 'Group' })).toHaveAttribute('aria-invalid', 'true');
            expect(screen.getByRole('alert')).toHaveTextContent('Group is required');
        });

        it('displays error when variant contains colon', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            selectOption('Daržovės');
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test:variant');
            await user.type(screen.getByRole('textbox', { name: 'Amount' }), '500');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
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
            selectOption('Uogienės');

            // Should now show Duplicate button (tests getButtonContent with groupChanged condition)
            expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument();
        });
    });

    describe('loading state with fake timers', () => {
        let resolveUpdate: () => void;

        beforeEach(() => vi.useFakeTimers());

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

            act(() => fireEvent.click(screen.getByRole('combobox', { name: 'Group' })));
            act(() =>
                fireEvent.change(screen.getByRole('combobox', { name: 'Group' }), { target: { value: 'Daržovės' } })
            );
            act(() => fireEvent.click(screen.getByRole('option', { name: 'Daržovės' })));
            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Variant name' }), {
                    target: { value: 'New Variant' },
                })
            );
            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Amount' }), { target: { value: '500' } })
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

            act(() => fireEvent.click(screen.getByRole('combobox', { name: 'Group' })));
            act(() =>
                fireEvent.change(screen.getByRole('combobox', { name: 'Group' }), { target: { value: 'Daržovės' } })
            );
            act(() => fireEvent.click(screen.getByRole('option', { name: 'Daržovės' })));
            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Variant name' }), {
                    target: { value: 'Fast Variant' },
                })
            );
            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Amount' }), { target: { value: '500' } })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
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
