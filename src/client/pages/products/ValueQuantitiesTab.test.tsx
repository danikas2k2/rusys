import { fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ValueQuantitiesTab } from '~/client/pages/products/ValueQuantitiesTab';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import type { ProductAmounts } from '~/types/data';

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

jest.mock('~/client/pages/products/VariantEditRow', () => ({
    VariantEditRow: jest.fn(({ type, delta, onChange }: any) => (
        <div data-testid={`edit-row-${type}`}>
            <button type="button" onClick={() => onChange(type, delta - 1)}>
                {`decrease-${type}`}
            </button>
        </div>
    )),
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

    it('clicking a row expands inline edit rows', async () => {
        renderTab();

        expect(screen.queryByTestId('edit-row-updated')).not.toBeInTheDocument();

        await user.click(screen.getAllByRole('row')[0]);

        expect(screen.getByTestId('edit-row-updated')).toBeInTheDocument();
        expect(screen.getByTestId('edit-row-consumed')).toBeInTheDocument();
        expect(screen.getByTestId('edit-row-recycled')).toBeInTheDocument();
    });

    it('clicking expanded row collapses it', async () => {
        renderTab();

        await user.click(screen.getAllByRole('row')[0]);
        expect(screen.getByTestId('edit-row-updated')).toBeInTheDocument();

        await user.click(screen.getAllByRole('row')[0]);
        expect(screen.queryByTestId('edit-row-updated')).not.toBeInTheDocument();
    });

    it('clicking a different row switches expansion', async () => {
        renderTab();

        await user.click(screen.getAllByRole('row')[0]);
        expect(screen.getByTestId('edit-row-updated')).toBeInTheDocument();

        await user.click(screen.getAllByRole('row')[1]);
        expect(screen.getByTestId('edit-row-updated')).toBeInTheDocument();
        // only one expanded row at a time — still one set of edit rows
        expect(screen.getAllByTestId('edit-row-updated')).toHaveLength(1);
    });

    it('does not show Undo/Redo buttons when canUndo and canRedo are false', () => {
        renderTab();

        expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /redo/i })).not.toBeInTheDocument();
    });

    it('select dropdown is present', () => {
        renderTab();

        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('selecting a variant from dropdown adds it to the list and expands it', async () => {
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'm' }));

        expect(screen.getAllByRole('row')).toHaveLength(3 + 1); // 3 variant rows + 1 expanded edit row
        expect(screen.getByTestId('edit-row-updated')).toBeInTheDocument();
    });

    it('calls updateProduct when Update is clicked after changing a delta', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn().mockResolvedValue(undefined);
        useUpdateProduct.mockReturnValue(mockUpdate);

        renderTab();

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByRole('button', { name: 'decrease-updated' }));
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.any(Array),
            'test@example.com',
            undefined
        );
    });

    it('does not show Update/Cancel buttons before any delta change', () => {
        renderTab();

        expect(screen.queryByRole('button', { name: /^update$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
    });

    it('Cancel clears deltas and hides Update/Cancel buttons', async () => {
        renderTab();

        await user.click(screen.getAllByRole('row')[0]);
        await user.click(screen.getByRole('button', { name: 'decrease-updated' }));
        expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^cancel$/i }));

        expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^update$/i })).not.toBeInTheDocument();
    });

    it('"New variant" option is present in the dropdown', () => {
        renderTab();

        fireEvent.click(screen.getByRole('combobox'));

        expect(screen.getByRole('option', { name: /new variant/i })).toBeInTheDocument();
    });

    it('selecting "New variant" opens VariantBox with group pre-filled', async () => {
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));

        expect(VariantBox).toHaveBeenCalledWith(expect.objectContaining({ opened: true, group }), undefined);
    });

    it('after creating a variant, it appears in the list and is expanded', async () => {
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));
        await user.click(screen.getByRole('button', { name: 'Create variant x' }));

        expect(screen.getByTestId('edit-row-updated')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(3 + 1); // 3 variants + 1 expanded
    });

    it('cancelling VariantBox without a variant does not change the list', async () => {
        renderTab();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /new variant/i }));
        await user.click(screen.getByRole('button', { name: 'Cancel add' }));

        expect(screen.getAllByRole('row')).toHaveLength(2);
    });
});
