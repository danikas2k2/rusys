import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ValueListBox, type ValueListBoxProps } from '~/client/pages/products/ValueListBox';
import { VariantEditBox } from '~/client/pages/products/VariantEditBox';
import { VariantBox } from '~/client/pages/variants/VariantBox';

jest.mock('~/client/pages/products/VariantEditBox', () => ({
    VariantEditBox: jest.fn(({ opened, onSubmit, onClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Edit variant">
                <button type="button" onClick={() => onSubmit({ updated: 1, consumed: -2, recycled: 0 })}>
                    Submit deltas
                </button>
                <button type="button" onClick={onClose}>
                    Close edit
                </button>
            </div>
        ) : null
    ),
}));

jest.mock('~/client/pages/variants/VariantBox', () => ({
    VariantBox: jest.fn(({ opened, onClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Add variant">
                <button type="button" onClick={() => onClose('Uogienės', 'x')}>
                    Create variant x
                </button>
                <button type="button" onClick={() => onClose()}>
                    Cancel add
                </button>
            </div>
        ) : null
    ),
}));

jest.mock('~/client/state/variants/useAllVariants', () => ({
    useAllVariants: jest.fn(() => ['p', 'd', 'm']),
}));

jest.mock('~/client/state/variants/useGroupVariantComparator', () => ({
    useGroupVariantComparator: jest.fn(() => (a: string, b: string) => a.localeCompare(b)),
}));

jest.mock('~/client/common/AmountSuffix', () => ({
    AmountSuffix: jest.fn().mockReturnValue(null),
}));

describe('<ValueListBox>', () => {
    const group = 'Uogienės';
    const amounts: ValueListBoxProps['amounts'] = [
        { variant: 'p', amount: 3 },
        { variant: 'd', amount: 1 },
    ];

    afterEach(() => jest.clearAllMocks());

    it('does not render when opened=false', () => {
        render(
            <MockTheme>
                <ValueListBox group={group} amounts={amounts} />
            </MockTheme>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when opened=true', () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows only variants with amount > 0', () => {
        const amountsWithZero: ValueListBoxProps['amounts'] = [
            { variant: 'p', amount: 3 },
            { variant: 'd', amount: 0 },
            { variant: 'm', amount: 1 },
        ];

        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amountsWithZero} />
            </MockTheme>
        );

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();

        // 'd' has amount 0, should not appear as a row
        const rows = screen.getAllByRole('row');

        expect(rows).toHaveLength(2);
    });

    it('clicking a row opens VariantEditBox with correct props', async () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} name="Avietės" year={2023} amounts={amounts} />
            </MockTheme>
        );

        // amounts sorted: d (amount 1), p (amount 3); first row is 'd'
        await user.click(screen.getAllByRole('row')[0]);

        expect(VariantEditBox).toHaveBeenCalledWith(
            expect.objectContaining({
                opened: true,
                group,
                name: 'Avietės',
                year: 2023,
                variant: 'd',
                currentAmount: 1,
            }),
            undefined
        );
    });

    it('does not show Undo/Redo buttons when both canUndo and canRedo are false', () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} canUndo={false} canRedo={false} />
            </MockTheme>
        );

        expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Redo' })).not.toBeInTheDocument();
    });

    it('shows Undo enabled and Redo disabled when canUndo=true and canRedo=false', () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} canUndo canRedo={false} />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
    });

    it('clicking Undo calls onUndo', async () => {
        const onUndo = jest.fn();

        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} canUndo onUndo={onUndo} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Undo' }));

        expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('select dropdown shows unused variants', () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        // allVariants = ['p', 'd', 'm']; present = ['d', 'p'] (amount > 0); unused = ['m']
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('selecting a variant from dropdown adds it to the list and opens VariantEditBox', async () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'm' }));

        expect(VariantEditBox).toHaveBeenCalledWith(
            expect.objectContaining({
                opened: true,
                variant: 'm',
                currentAmount: 0,
            }),
            undefined
        );
        // 'm' should now appear as a row in the table
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('calls onSubmit with correct VariantAmount[] when VariantEditBox submits deltas', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} onSubmit={onSubmit} />
            </MockTheme>
        );

        // Click the first row ('d' sorted first)
        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByRole('button', { name: 'Submit deltas' }));

        // updated: 1 → { variant: 'd', amount: 1 }
        // consumed: -2 → { variant: 'd', amount: -2, recycled: false }
        // recycled: 0 → not included
        expect(onSubmit).toHaveBeenCalledWith([
            { variant: 'd', amount: 1 },
            { variant: 'd', amount: -2, recycled: false },
        ]);
    });

    it('does not call onSubmit when VariantEditBox closes without submitting', async () => {
        const onSubmit = jest.fn();

        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} onSubmit={onSubmit} />
            </MockTheme>
        );

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByRole('button', { name: 'Close edit' }));

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('closing the modal calls onClose', async () => {
        const onClose = jest.fn();

        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('"Naujas variantas" option is always present in the dropdown', () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        // Open the combobox dropdown
        fireEvent.click(screen.getByRole('combobox'));

        expect(screen.getByRole('option', { name: /new variant/i })).toBeInTheDocument();
    });

    it('selecting "Naujas variantas" opens VariantBox with group pre-filled', async () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));

        expect(VariantBox).toHaveBeenCalledWith(expect.objectContaining({ opened: true, group }), undefined);
    });

    it('after creating a variant, it appears in the list and VariantEditBox opens for it', async () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));
        await user.click(screen.getByRole('button', { name: 'Create variant x' }));

        expect(VariantEditBox).toHaveBeenCalledWith(
            expect.objectContaining({ opened: true, variant: 'x', currentAmount: 0 }),
            undefined
        );
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('cancelling VariantBox without a variant does not change the list', async () => {
        render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} />
            </MockTheme>
        );

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));
        await user.click(screen.getByRole('button', { name: 'Cancel add' }));

        expect(screen.getAllByRole('row')).toHaveLength(2);
    });

    it('calls onAfterClose after exit transition ends', async () => {
        const onAfterClose = jest.fn();

        const { rerender } = render(
            <MockTheme>
                <ValueListBox opened group={group} amounts={amounts} onAfterClose={onAfterClose} />
            </MockTheme>
        );

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Close' }));

        rerender(
            <MockTheme>
                <ValueListBox opened={false} group={group} amounts={amounts} onAfterClose={onAfterClose} />
            </MockTheme>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });
});
