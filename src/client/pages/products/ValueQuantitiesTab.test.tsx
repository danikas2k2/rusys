import { fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ValueQuantitiesTab } from '~/client/pages/products/ValueQuantitiesTab';
import { VariantEditBox } from '~/client/pages/products/VariantEditBox';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import type { ProductAmounts } from '~/types/data';

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

jest.mock('~/client/pages/products/UpdatingProductsContext', () => ({
    useUpdatingProducts: jest.fn(() => [{}, jest.fn()]),
}));

jest.mock('~/client/state/products/useProducts', () => ({
    useProducts: jest.fn(() => []),
}));

jest.mock('~/client/state/products/useUpdateProduct', () => ({
    useUpdateProduct: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
}));

jest.mock('~/client/state/products/useUndoProduct', () => ({
    useUndoProduct: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
}));

jest.mock('~/client/state/products/useRedoProduct', () => ({
    useRedoProduct: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
}));

jest.mock('~/client/state/profile/useProfile', () => ({
    useProfile: jest.fn(() => ({ email: 'test@example.com' })),
}));

describe('<ValueQuantitiesTab>', () => {
    const group = 'Uogienės';
    const baseActive: ProductAmounts = {
        group,
        name: 'Avietės',
        year: 2023,
        amounts: [
            { variant: 'p', amount: 3 },
            { variant: 'd', amount: 1 },
        ],
    };

    afterEach(() => jest.clearAllMocks());

    function renderTab(active: ProductAmounts = baseActive) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <ValueQuantitiesTab />
            </MockThemeActive>
        );
    }

    it('shows only variants with amount > 0', () => {
        renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 0 },
                { variant: 'm', amount: 1 },
            ],
        });

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(2);
    });

    it('clicking a row opens VariantEditBox with correct props', async () => {
        renderTab();

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

    it('does not show Undo/Redo buttons when canUndo and canRedo are false', () => {
        renderTab();

        expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Redo' })).not.toBeInTheDocument();
    });

    it('select dropdown is present', () => {
        renderTab();

        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('selecting a variant from dropdown adds it to the list and opens VariantEditBox', async () => {
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'm' }));

        expect(VariantEditBox).toHaveBeenCalledWith(
            expect.objectContaining({ opened: true, variant: 'm', currentAmount: 0 }),
            undefined
        );
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('calls updateProduct when VariantEditBox submits deltas', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn().mockResolvedValue(undefined);
        useUpdateProduct.mockReturnValue(mockUpdate);

        renderTab();

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByRole('button', { name: 'Submit deltas' }));

        expect(mockUpdate).toHaveBeenCalledWith(group, 'Avietės', 2023, expect.any(Array), 'test@example.com');
    });

    it('does not call updateProduct when VariantEditBox closes without submitting', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn();
        useUpdateProduct.mockReturnValue(mockUpdate);

        renderTab();

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByRole('button', { name: 'Close edit' }));

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('"Naujas variantas" option is present in the dropdown', () => {
        renderTab();

        fireEvent.click(screen.getByRole('combobox'));

        expect(screen.getByRole('option', { name: /new variant/i })).toBeInTheDocument();
    });

    it('selecting "Naujas variantas" opens VariantBox with group pre-filled', async () => {
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));

        expect(VariantBox).toHaveBeenCalledWith(expect.objectContaining({ opened: true, group }), undefined);
    });

    it('after creating a variant, it appears in the list and VariantEditBox opens for it', async () => {
        renderTab();

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
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));
        await user.click(screen.getByRole('button', { name: 'Cancel add' }));

        expect(screen.getAllByRole('row')).toHaveLength(2);
    });
});
