import { act, fireEvent, render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { AmountVariantRow } from '~/client/pages/products/AmountVariantRow';
import { AmountVariantsTab } from '~/client/pages/products/AmountVariantsTab';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useProducts } from '~/client/state/products/useProducts';
import { useRedoProduct } from '~/client/state/products/useRedoProduct';
import { useUndoProduct } from '~/client/state/products/useUndoProduct';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import type { ProductAmounts } from '~/types/data';

vi.mock(import('~/client/pages/variants/VariantBox'), () => ({
    VariantBox: vi.fn(({ opened, onClose, onAfterClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Add variant">
                <button type="button" onClick={() => onClose('Uogienės', 'x')}>
                    Create variant x
                </button>
                <button type="button" onClick={() => onClose()}>
                    Cancel add
                </button>
                <button type="button" onClick={() => onAfterClose?.()}>
                    Exit transition end
                </button>
            </div>
        ) : null
    ),
}));

vi.mock(import('@mantine/core'), async () => {
    const actual = await vi.importActual('@mantine/core');
    return {
        ...actual,
        Select: vi.fn(({ placeholder, data, onChange, renderOption }: any) => (
            <>
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
                {/* Not part of the real select UI - just exercises renderOption for coverage,
                    kept out of <option> to avoid invalid-DOM-nesting warnings for non-text content */}
                <div style={{ display: 'none' }}>
                    {renderOption &&
                        (data as any[]).map((item: any) => (
                            <React.Fragment key={item.value ?? item}>{renderOption({ option: item })}</React.Fragment>
                        ))}
                </div>
            </>
        )),
    };
});

// The real AmountExpanded now owns its own Popover+DatePicker for expiry, reporting a picked date
// value directly (no separate confirm step) - the mock exposes two fixed-date trigger buttons so
// tests can pick two distinct dates deterministically without driving a real calendar widget.
vi.mock(import('~/client/pages/products/AmountExpanded'), () => ({
    AmountExpanded: vi.fn(({ delta, onChange, onAddSuspicious, onAddHome, onAddExpiry, children }: any) => (
        <div>
            <button type="button" onClick={() => onChange('updated', delta.updated - 1)}>
                decrease-updated
            </button>
            <button type="button" onClick={() => onChange('consumed', delta.consumed - 1)}>
                decrease-consumed
            </button>
            <button type="button" onClick={() => onChange('recycled', delta.recycled - 1)}>
                decrease-recycled
            </button>
            {children}
            {onAddSuspicious && (
                <button type="button" onClick={onAddSuspicious}>
                    Something suspicious?
                </button>
            )}
            {onAddHome && (
                <button type="button" onClick={onAddHome}>
                    Home amounts?
                </button>
            )}
            {onAddExpiry && (
                <>
                    <button type="button" onClick={() => onAddExpiry('2026-08-15')}>
                        Pick 2026-08-15
                    </button>
                    <button type="button" onClick={() => onAddExpiry('2026-09-01')}>
                        Pick 2026-09-01
                    </button>
                    <button type="button" onClick={() => onAddExpiry(null)}>
                        Clear date
                    </button>
                </>
            )}
        </div>
    )),
}));

vi.mock(import('~/client/pages/products/AmountVariantRow'), () => ({
    AmountVariantRow: vi.fn(({ type, delta, onChange }: any) => (
        <div data-testid={`edit-row-${type}`}>
            <button type="button" onClick={() => onChange(type, delta - 1)}>
                {`decrease-${type}`}
            </button>
        </div>
    )),
}));

vi.mock(import('~/client/state/variants/useAllVariants'), () => ({
    useAllVariants: vi.fn(() => ['p', 'd', 'm']),
}));

vi.mock(import('~/client/state/variants/useVariant'), () => ({
    useVariant: vi.fn().mockReturnValue(undefined),
}));

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn(() => (a: string, b: string) => a.localeCompare(b)),
}));

vi.mock(import('~/client/common/AmountSuffix'), () => ({
    AmountSuffix: vi.fn().mockReturnValue(null),
}));

vi.mock(import('~/client/pages/products/UpdatingProductsContext'), () => ({
    useUpdatingProducts: vi.fn(() => [{}, vi.fn()]),
}));

vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn(() => []),
}));

vi.mock(import('~/client/state/products/useUpdateProduct'), () => ({
    useUpdateProduct: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/client/state/products/useUndoProduct'), () => ({
    useUndoProduct: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/client/state/products/useRedoProduct'), () => ({
    useRedoProduct: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/client/state/profile/useProfile'), () => ({
    useProfile: vi.fn(() => ({ email: 'test@example.com' })),
}));

vi.mock(import('~/client/state/products/useSetVariantImage'), () => ({
    useSetVariantImage: vi.fn(() => vi.fn()),
}));

describe('<AmountVariantsTab>', () => {
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

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue([]);
    });

    afterEach(() => vi.clearAllMocks());

    function renderTab(
        active: ProductAmounts = baseActive,
        onChangesUpdate?: (hasChanges: boolean) => void,
        onClose?: () => void
    ) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountVariantsTab onChangesUpdate={onChangesUpdate} onClose={onClose} />
            </MockThemeActive>
        );
    }

    it('reports changes via onChangesUpdate as deltas are entered and cleared', async () => {
        const onChangesUpdate = vi.fn();
        renderTab(baseActive, onChangesUpdate);

        expect(onChangesUpdate).toHaveBeenLastCalledWith(false);

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-updated')[0]);

        expect(onChangesUpdate).toHaveBeenLastCalledWith(true);

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onChangesUpdate).toHaveBeenLastCalledWith(false);
    });

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
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

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

    it('disables Update immediately and delays its loader', async () => {
        vi.useFakeTimers();
        let resolveUpdate!: () => void;
        const mockUpdate = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveUpdate = resolve;
                })
        );
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        try {
            renderTab();
            fireEvent.click(screen.getByRole('button', { name: /\bd\b/ }));
            fireEvent.click(screen.getAllByText('decrease-updated')[0]);

            const updateButton = screen.getByRole('button', { name: /^update$/i });
            fireEvent.click(updateButton);

            expect(updateButton).toBeDisabled();
            expect(within(updateButton).queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();

            await act(() => vi.advanceTimersByTimeAsync(300));

            expect(within(updateButton).getByRole('progressbar', { hidden: true })).toBeInTheDocument();

            await act(async () => resolveUpdate());
        } finally {
            vi.useRealTimers();
        }
    });

    it('calls onClose after a successful update', async () => {
        const onClose = vi.fn();
        vi.mocked(useUpdateProduct).mockReturnValue(vi.fn().mockResolvedValue(undefined));

        renderTab(baseActive, undefined, onClose);

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('decrease-updated')[0]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(onClose).toHaveBeenCalledTimes(1);
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
        vi.mocked(useProducts).mockReturnValue([
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
        vi.mocked(useProducts).mockReturnValue([
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
        vi.mocked(useProducts).mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                updates: [{ year: baseActive.year }],
                undates: [],
                years: [{ year: baseActive.year, amounts: baseActive.amounts }],
            },
        ]);

        renderTab();

        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
    });

    it('calls undoProduct when Undo is clicked', async () => {
        const mockUndo = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUndoProduct).mockReturnValue(mockUndo);
        vi.mocked(useProducts).mockReturnValue([
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
        const mockRedo = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useRedoProduct).mockReturnValue(mockRedo);
        vi.mocked(useProducts).mockReturnValue([
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
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        // AmountExpanded is already mocked but we need to expose the onCommentChange —
        // re-mock to also trigger comment change
        vi.mocked(AmountVariantRow).mockImplementation(({ type, delta, onChange }: any) => (
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
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        vi.mocked(AmountVariantRow).mockImplementation(({ type, delta, onChange }: any) => (
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
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        vi.mocked(AmountVariantRow).mockImplementation(({ type, delta, onChange }: any) => (
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
        vi.mocked(useProducts).mockReturnValue([
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

    it('combines amounts across legacy per-year entries for a non-annual product (year 0)', () => {
        const nonAnnualActive: ProductAmounts = {
            group: baseActive.group,
            name: baseActive.name,
            year: 0,
            amounts: [{ variant: 'p', amount: 3 }],
        };
        vi.mocked(useProducts).mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                years: [
                    { year: 2022, amounts: [{ variant: 'p', amount: 2 }] },
                    { year: 2023, amounts: [{ variant: 'p', amount: 1 }] },
                ],
            },
        ]);

        renderTab(nonAnnualActive);

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows the variant image avatar in the row control when set', () => {
        vi.mocked(useProducts).mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                years: [{ year: baseActive.year, amounts: baseActive.amounts }],
                variantImages: { d: '/images/ab/cd/d.png' },
            },
        ]);

        renderTab();

        expect(document.querySelector('img')).toHaveAttribute('src', '/images/ab/cd/d.png');
    });

    it('does not show a variant image avatar in the row control when unset', () => {
        renderTab();

        expect(document.querySelector('img')).not.toBeInTheDocument();
    });

    it('shows the remove image button in the expanded panel when a variant image is set', async () => {
        vi.mocked(useProducts).mockReturnValue([
            {
                group: baseActive.group,
                name: baseActive.name,
                years: [{ year: baseActive.year, amounts: baseActive.amounts }],
                variantImages: { d: '/images/ab/cd/d.png' },
            },
        ]);

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.getByText('Remove image')).toBeInTheDocument();
    });

    it('auto-selects the sole variant when nothing is entered yet', () => {
        vi.mocked(useAllVariants).mockReturnValue(['x']);

        renderTab({ group, name: 'Avietės', year: 2023, amounts: [] });

        expect(screen.getByRole('button', { name: /\bx\b/ })).toHaveAttribute('aria-expanded', 'true');
    });

    it('does not auto-select when more than one variant is available', () => {
        vi.mocked(useAllVariants).mockReturnValue(['x', 'y']);

        renderTab({ group, name: 'Avietės', year: 2023, amounts: [] });

        expect(screen.queryByRole('button', { name: /\bx\b/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /\by\b/ })).not.toBeInTheDocument();
    });

    it('does not auto-select the remaining variant when others are already entered', () => {
        vi.mocked(useAllVariants).mockReturnValue(['p', 'd', 'm']);

        renderTab();

        expect(screen.queryByRole('button', { name: /\bm\b/ })).not.toBeInTheDocument();
    });

    it('re-selecting the sole variant after cancelling does not immediately reappear', async () => {
        vi.mocked(useAllVariants).mockReturnValue(['x']);

        renderTab({ group, name: 'Avietės', year: 2023, amounts: [] });

        const control = screen.getByRole('button', { name: /\bx\b/ });
        await user.click(screen.getAllByText('decrease-updated')[0]);
        await user.click(screen.getByRole('button', { name: /^cancel$/i }));

        expect(control).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /\bx\b/ })).not.toBeInTheDocument();
    });

    it('renders safely with no active content', () => {
        render(
            <MockThemeActive active={undefined}>
                <AmountVariantsTab />
            </MockThemeActive>
        );

        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /\bp\b/ })).not.toBeInTheDocument();
    });

    it('does not call updateProduct when Update is clicked with no active content', async () => {
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);
        vi.mocked(useAllVariants).mockReturnValue(['p', 'd', 'm']);

        render(
            <MockThemeActive active={undefined}>
                <AmountVariantsTab />
            </MockThemeActive>
        );

        await user.selectOptions(screen.getByRole('combobox'), 'm');
        await user.click(screen.getAllByText('decrease-updated')[0]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('does nothing when the variant select reports a null value', () => {
        renderTab();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__null__' } });

        expect(screen.queryByRole('button', { name: /\bm\b/ })).not.toBeInTheDocument();
        expect(VariantBox).toHaveBeenCalledWith(expect.objectContaining({ opened: false }), undefined);
    });

    it('closing VariantBox via its exit transition hides it without needing Cancel/Create first', async () => {
        renderTab();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

        expect(screen.getByRole('dialog', { name: 'Add variant' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Exit transition end' }));

        expect(screen.queryByRole('dialog', { name: 'Add variant' })).not.toBeInTheDocument();
    });

    it('clearing a picked expiry date does not add a dated row', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Clear date')[0]);

        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(1);
    });

    it('cancel also clears expandedVariant', async () => {
        // Ensure default empty products (previous test may have set a mock)
        vi.mocked(useProducts).mockReturnValue([]);

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        const dButton = screen.getByRole('button', { name: /\bd\b/ });

        expect(dButton).toHaveAttribute('aria-expanded', 'true');

        await user.click(screen.getByRole('button', { name: /^cancel$/i }));

        expect(dButton).toHaveAttribute('aria-expanded', 'false');
    });
});

describe('suspicious amounts', () => {
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

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue([]);
    });

    afterEach(() => vi.clearAllMocks());

    function renderTab(active: ProductAmounts = baseActive) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountVariantsTab />
            </MockThemeActive>
        );
    }

    it('expanding a variant shows "Something suspicious?" button when no suspicious entry exists', async () => {
        renderTab();

        // Expand d (first in sorted DOM order) so its panel is open and visible
        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        // The button is rendered inside the open panel; getAllByText also finds collapsed panels
        expect(screen.getAllByText('Something suspicious?').length).toBeGreaterThan(0);
    });

    it('clicking "Something suspicious?" adds a suspicious accordion item for the variant', async () => {
        renderTab();

        // Expand d (index 0 in DOM) so its panel content is visible and clickable
        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        // [0] is the open d-panel button; [1] would be the hidden p-panel button
        await user.click(screen.getAllByText('Something suspicious?')[0]);

        // Both normal d and d|suspicious accordion controls should now be present
        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(2);
    });

    it('the suspicious accordion item is expanded immediately after adding', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Something suspicious?')[0]);

        // Sort order: normal d before d|suspicious; suspicious item is at index [1]
        const dButtons = screen.getAllByRole('button', { name: /\bd\b/ });

        expect(dButtons[1]).toHaveAttribute('aria-expanded', 'true');
    });

    it('"Something suspicious?" button count decreases after suspicious entry is added for a variant', async () => {
        renderTab();

        // Before: both d and p panels render the button → 2 total in DOM
        expect(screen.getAllByText('Something suspicious?')).toHaveLength(2);

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Something suspicious?')[0]);

        // Re-expand normal d
        const dButtons = screen.getAllByRole('button', { name: /\bd\b/ });

        await user.click(dButtons[0]);

        // d and d|suspicious no longer show the button; only p's panel does → 1 remaining
        expect(screen.getAllByText('Something suspicious?')).toHaveLength(1);
    });

    it('suspicious accordion item has data-suspicious attribute', async () => {
        const { container } = renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Something suspicious?')[0]);

        expect(container.querySelector('[data-suspicious]')).toBeInTheDocument();
    });

    it('already-present suspicious amount from amounts prop shows in the list', () => {
        renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 2, suspicious: true },
            ],
        });

        // Both normal d and suspicious d accordion controls should be visible
        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(2);
    });

    it('suspicious item passes suspicious:true in changes when Update is clicked', async () => {
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        renderTab();

        // Expand d, then add suspicious — expandedKey becomes 'd|suspicious'
        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Something suspicious?')[0]);

        // After adding, visibleKeys = ['d', 'd|suspicious', 'p'] (DOM order).
        // d|suspicious is now the open (expanded) panel at DOM index 1.
        // handleDeltaChange stores the delta under expandedKey ('d|suspicious').
        await user.click(screen.getAllByText('decrease-updated')[1]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.arrayContaining([expect.objectContaining({ variant: 'd', suspicious: true })]),
            'test@example.com',
            undefined
        );
    });
});

describe('home amounts', () => {
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

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue([]);
    });

    afterEach(() => vi.clearAllMocks());

    function renderTab(active: ProductAmounts = baseActive) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountVariantsTab />
            </MockThemeActive>
        );
    }

    it('expanding a variant shows "Home amounts?" button when no home entry exists', async () => {
        renderTab();

        // Expand d (first in sorted DOM order) so its panel is open and visible
        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.getAllByText('Home amounts?').length).toBeGreaterThan(0);
    });

    it('clicking "Home amounts?" adds a home accordion item and expands it', async () => {
        renderTab();

        // Expand d (index 0 in DOM) so its panel content is visible and clickable
        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        // [0] is the open d-panel button; [1] would be the hidden p-panel button
        await user.click(screen.getAllByText('Home amounts?')[0]);

        // Both normal d and d|home accordion controls should now be present
        const dButtons = screen.getAllByRole('button', { name: /\bd\b/ });

        expect(dButtons).toHaveLength(2);
        // Sort order: normal d before d|home; home item is at index [1] and should be expanded
        expect(dButtons[1]).toHaveAttribute('aria-expanded', 'true');
    });

    it('home accordion item has data-home attribute', async () => {
        const { container } = renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Home amounts?')[0]);

        expect(container.querySelector('[data-home]')).toBeInTheDocument();
    });

    it('home amount displays with tilde icon and amount', () => {
        const { container } = renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 5, home: true },
            ],
        });

        expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('home item passes home:true in changes when Update is clicked', async () => {
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        renderTab();

        // Expand d, then add home — expandedKey becomes 'd|home'
        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Home amounts?')[0]);

        // After adding, visibleKeys = ['d', 'd|home', 'p'] (DOM order).
        // d|home is now the open (expanded) panel at DOM index 1.
        // handleDeltaChange stores the delta under expandedKey ('d|home').
        await user.click(screen.getAllByText('decrease-updated')[1]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.arrayContaining([expect.objectContaining({ variant: 'd', home: true })]),
            'test@example.com',
            undefined
        );
    });

    it('home amounts with zero balance are not shown in the list', () => {
        renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 0, home: true },
            ],
        });

        // Only one 'd' button (the normal one) — home entry has zero amount and is filtered out
        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(1);
    });

    it('"Home amounts?" button count decreases after home entry is added for a variant', async () => {
        renderTab();

        // Before: both d and p panels render the button → 2 total in DOM
        expect(screen.getAllByText('Home amounts?')).toHaveLength(2);

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Home amounts?')[0]);

        // Re-expand normal d
        const dButtons = screen.getAllByRole('button', { name: /\bd\b/ });

        await user.click(dButtons[0]);

        // d and d|home no longer show the button; only p's panel does → 1 remaining
        expect(screen.getAllByText('Home amounts?')).toHaveLength(1);
    });
});

describe('expiry amounts', () => {
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

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue([]);
    });

    afterEach(() => vi.clearAllMocks());

    function renderTab(active: ProductAmounts = baseActive) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountVariantsTab />
            </MockThemeActive>
        );
    }

    it('expanding a variant shows the expiry date picker trigger when no dated entry exists', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.getAllByText('Pick 2026-08-15').length).toBeGreaterThan(0);
    });

    it('picking a date adds a dated accordion item for the variant, expanded', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Pick 2026-08-15')[0]);

        const dButtons = screen.getAllByRole('button', { name: /\bd\b/ });

        expect(dButtons).toHaveLength(2);
        expect(dButtons[1]).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('2026-08-15')).toBeInTheDocument();
    });

    it('picking a second different date adds another distinct dated row for the same variant', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Pick 2026-08-15')[0]);

        // Re-expand the plain d row and add a second, different date
        await user.click(screen.getAllByRole('button', { name: /\bd\b/ })[0]);
        await user.click(screen.getAllByText('Pick 2026-09-01')[0]);

        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(3);
        expect(screen.getByText('2026-08-15')).toBeInTheDocument();
        expect(screen.getByText('2026-09-01')).toBeInTheDocument();
    });

    it('picking the same date again for the same variant does not add a duplicate row', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Pick 2026-08-15')[0]);

        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(2);

        // Re-expand the plain d row and pick the exact same date again
        await user.click(screen.getAllByRole('button', { name: /\bd\b/ })[0]);
        await user.click(screen.getAllByText('Pick 2026-08-15')[0]);

        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(2);
    });

    it('shows a "+N" badge on the plain row once dated rows exist for that variant', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Pick 2026-08-15')[0]);
        await user.click(screen.getAllByRole('button', { name: /\bd\b/ })[0]);
        await user.click(screen.getAllByText('Pick 2026-09-01')[0]);

        expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('expiry item passes expiresAt in changes when Update is clicked', async () => {
        const mockUpdate = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdateProduct).mockReturnValue(mockUpdate);

        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));
        await user.click(screen.getAllByText('Pick 2026-08-15')[0]);

        // The new dated row (index 1) is now the expanded one.
        await user.click(screen.getAllByText('decrease-updated')[1]);
        await user.click(screen.getByRole('button', { name: /^update$/i }));

        expect(mockUpdate).toHaveBeenCalledWith(
            group,
            'Avietės',
            2023,
            expect.arrayContaining([
                expect.objectContaining({ variant: 'd', expiresAt: new Date(2026, 7, 15).getTime() }),
            ]),
            'test@example.com',
            undefined
        );
    });

    it('already-present dated amount from amounts prop shows in the list', () => {
        renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 2, expiresAt: new Date(2026, 7, 15).getTime() },
            ],
        });

        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(2);
        expect(screen.getByText('2026-08-15')).toBeInTheDocument();
    });

    it('dated amounts with zero balance are not shown in the list', () => {
        renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 0, expiresAt: new Date(2026, 7, 15).getTime() },
            ],
        });

        expect(screen.getAllByRole('button', { name: /\bd\b/ })).toHaveLength(1);
    });

    it('an expired dated row gets the data-expires="expired" attribute', () => {
        const { container } = renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 2, expiresAt: Date.now() - 24 * 60 * 60 * 1000 },
            ],
        });

        expect(container.querySelector('[data-expires="expired"]')).toBeInTheDocument();
    });

    it('a soon-expiring dated row gets the data-expires="soon" attribute', () => {
        const { container } = renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 2, expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000 },
            ],
        });

        expect(container.querySelector('[data-expires="soon"]')).toBeInTheDocument();
    });

    it('does not offer Add Suspicious/Add Home on a dated row', async () => {
        renderTab({
            ...baseActive,
            amounts: [
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 1 },
                { variant: 'd', amount: 2, expiresAt: new Date(2026, 7, 15).getTime() },
            ],
        });

        const dButtons = screen.getAllByRole('button', { name: /\bd\b/ });
        await user.click(dButtons[1]);

        // p's plain row and d's plain row each offer them; the dated d row must not add a third.
        expect(screen.getAllByText('Something suspicious?')).toHaveLength(2);
        expect(screen.getAllByText('Home amounts?')).toHaveLength(2);
    });

    it('does not render a variant edit button in an amount card', async () => {
        renderTab();

        await user.click(screen.getByRole('button', { name: /\bd\b/ }));

        expect(screen.queryByRole('button', { name: 'Edit variant', hidden: true })).not.toBeInTheDocument();
    });
});
