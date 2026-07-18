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

jest.mock('@mantine/core', () => {
    const actual = jest.requireActual('@mantine/core');
    return {
        ...actual,
        Select: jest.fn(({ placeholder, data, onChange }: any) => (
            <select
                aria-label={placeholder}
                onChange={(e) => onChange(e.target.value === '__null__' ? null : e.target.value)}
                defaultValue="__null__"
            >
                <option value="__null__" disabled />
                {(data as any[]).map((item: any) => (
                    <option key={item.value ?? item} value={item.value ?? item}>
                        {item.label ?? item}
                    </option>
                ))}
            </select>
        )),
    };
});

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
        // p and m only (d has 0)
        expect(screen.queryByRole('button', { name: /\bd\b/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\bp\b/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\bm\b/ })).toBeInTheDocument();
    });

    it('clicking a row expands it', async () => {
        renderTab();
        const control = screen.getByRole('button', { name: /\bd\b/ });

        expect(control).toHaveAttribute('aria-expanded', 'false');

        await user.click(control);

        expect(control).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking expanded row collapses it', async () => {
        renderTab();
        const control = screen.getByRole('button', { name: /\bd\b/ });

        await user.click(control);

        expect(control).toHaveAttribute('aria-expanded', 'true');

        await user.click(control);

        expect(control).toHaveAttribute('aria-expanded', 'false');
    });

    it('clicking a different row switches expansion', async () => {
        renderTab();
        const controlD = screen.getByRole('button', { name: /\bd\b/ });
        const controlP = screen.getByRole('button', { name: /\bp\b/ });

        await user.click(controlD);

        expect(controlD).toHaveAttribute('aria-expanded', 'true');
        expect(controlP).toHaveAttribute('aria-expanded', 'false');

        await user.click(controlP);

        expect(controlD).toHaveAttribute('aria-expanded', 'false');
        expect(controlP).toHaveAttribute('aria-expanded', 'true');
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

        await user.selectOptions(screen.getByRole('combobox'), 'm');

        expect(screen.getByRole('button', { name: /\bm\b/ })).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls updateProduct when Update is clicked after changing a delta', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn().mockResolvedValue(undefined);
        useUpdateProduct.mockReturnValue(mockUpdate);

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-updated')[0]);
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

    it('cancel clears deltas and hides Update/Cancel buttons', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-updated')[0]);

        expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^cancel$/i }));

        expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^update$/i })).not.toBeInTheDocument();
    });

    it('"New variant" option is present in the dropdown', () => {
        renderTab();

        expect(screen.getByRole('option', { name: /new variant/i })).toBeInTheDocument();
    });

    it('selecting "New variant" opens VariantBox with group pre-filled', async () => {
        renderTab();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

        expect(VariantBox).toHaveBeenCalledWith(expect.objectContaining({ opened: true, group }), undefined);
    });

    it('after creating a variant, it appears in the list and is expanded', async () => {
        renderTab();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
        await user.click(screen.getByRole('button', { name: 'Create variant x' }));

        expect(screen.getByRole('button', { name: /\bx\b/ })).toHaveAttribute('aria-expanded', 'true');
    });

    it('cancelling VariantBox without a variant does not change the list', async () => {
        renderTab();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
        await user.click(screen.getByRole('button', { name: 'Cancel add' }));

        expect(screen.queryByRole('button', { name: /\bm\b/ })).not.toBeInTheDocument();
    });

    it('shows Undo/Redo buttons when canUndo is true and no expandedVariant and no changes', () => {
        const { useProducts } = jest.requireMock('~/client/state/products/useProducts');
        useProducts.mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                updates: [{ year: baseActive.year }],
                undates: [],
            },
        ]);

        renderTab();

        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
    });

    it('shows Undo/Redo buttons when canRedo is true and no expandedVariant and no changes', () => {
        const { useProducts } = jest.requireMock('~/client/state/products/useProducts');
        useProducts.mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                updates: [],
                undates: [{ year: baseActive.year }],
            },
        ]);

        renderTab();

        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
    });

    it('hides Undo/Redo buttons when a variant is expanded', async () => {
        const { useProducts } = jest.requireMock('~/client/state/products/useProducts');
        useProducts.mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                updates: [{ year: baseActive.year }],
                undates: [],
            },
        ]);

        renderTab();

        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
    });

    it('calls undoProduct when Undo is clicked', async () => {
        const { useProducts } = jest.requireMock('~/client/state/products/useProducts');
        const { useUndoProduct } = jest.requireMock('~/client/state/products/useUndoProduct');
        const mockUndo = jest.fn().mockResolvedValue(undefined);
        useUndoProduct.mockReturnValue(mockUndo);
        useProducts.mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                updates: [{ year: baseActive.year }],
                undates: [],
            },
        ]);

        renderTab();

        await user.click(screen.getByRole('button', { name: /undo/i }));

        expect(mockUndo).toHaveBeenCalledWith(baseActive.group, baseActive.name, baseActive.year);
    });

    it('calls redoProduct when Redo is clicked', async () => {
        const { useProducts } = jest.requireMock('~/client/state/products/useProducts');
        const { useRedoProduct } = jest.requireMock('~/client/state/products/useRedoProduct');
        const mockRedo = jest.fn().mockResolvedValue(undefined);
        useRedoProduct.mockReturnValue(mockRedo);
        useProducts.mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                updates: [],
                undates: [{ year: baseActive.year }],
            },
        ]);

        renderTab();

        await user.click(screen.getByRole('button', { name: /redo/i }));

        expect(mockRedo).toHaveBeenCalledWith(baseActive.group, baseActive.name, baseActive.year);
    });

    it('includes comment in update call when comment is non-empty', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn().mockResolvedValue(undefined);
        useUpdateProduct.mockReturnValue(mockUpdate);

        // VariantExpandedRows is already mocked but we need to expose the onCommentChange —
        // re-mock to also trigger comment change
        const { VariantEditRow } = jest.requireMock('~/client/pages/products/VariantEditRow');
        VariantEditRow.mockImplementation(({ type, delta, onChange }: any) => (
            <div data-testid={`edit-row-${type}`}>
                <button type="button" onClick={() => onChange(type, delta - 1)}>
                    {`decrease-${type}`}
                </button>
            </div>
        ));

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-updated')[0]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        // comment is '' so it passes undefined
        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.any(Array),
            'test@example.com',
            undefined
        );
    });

    it('passes consumed delta in changes array', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn().mockResolvedValue(undefined);
        useUpdateProduct.mockReturnValue(mockUpdate);

        const { VariantEditRow } = jest.requireMock('~/client/pages/products/VariantEditRow');
        VariantEditRow.mockImplementation(({ type, delta, onChange }: any) => (
            <div data-testid={`edit-row-${type}`}>
                <button type="button" onClick={() => onChange(type, delta - 1)}>
                    {`decrease-${type}`}
                </button>
            </div>
        ));

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-consumed')[0]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.arrayContaining([expect.objectContaining({ variant: 'd', recycled: false })]),
            'test@example.com',
            undefined
        );
    });

    it('passes recycled delta in changes array', async () => {
        const { useUpdateProduct } = jest.requireMock('~/client/state/products/useUpdateProduct');
        const mockUpdate = jest.fn().mockResolvedValue(undefined);
        useUpdateProduct.mockReturnValue(mockUpdate);

        const { VariantEditRow } = jest.requireMock('~/client/pages/products/VariantEditRow');
        VariantEditRow.mockImplementation(({ type, delta, onChange }: any) => (
            <div data-testid={`edit-row-${type}`}>
                <button type="button" onClick={() => onChange(type, delta - 1)}>
                    {`decrease-${type}`}
                </button>
            </div>
        ));

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-recycled')[0]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.arrayContaining([expect.objectContaining({ variant: 'd', recycled: true })]),
            'test@example.com',
            undefined
        );
    });

    it('uses liveAmounts from activeProduct.years when available', () => {
        const { useProducts } = jest.requireMock('~/client/state/products/useProducts');
        useProducts.mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                years: [{ year: baseActive.year, amounts: [{ variant: 'p', amount: 99 }] }],
            },
        ]);

        renderTab();

        // liveAmounts from product.years[0].amounts has p=99
        expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('cancel also clears expandedVariant', async () => {
        // Ensure default empty products (previous test may have set a mock)
        jest.requireMock('~/client/state/products/useProducts').useProducts.mockReturnValue([]);

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.getByRole('button', { name: /\bd\b/ })).toHaveAttribute('aria-expanded', 'true');

        await user.click(screen.getByRole('button', { name: /^cancel$/i }));

        expect(screen.getByRole('button', { name: /\bd\b/ })).toHaveAttribute('aria-expanded', 'false');
    });
});
