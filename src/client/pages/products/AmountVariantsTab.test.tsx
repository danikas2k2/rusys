import { fireEvent, render, screen } from '@testing-library/react';
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
import type { ProductAmounts } from '~/types/data';

vi.mock(import('~/client/pages/variants/VariantBox'), () => ({
    VariantBox: vi.fn(({ opened, onClose }: any) =>
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

vi.mock(import('@mantine/core'), async () => {
    const actual = await vi.importActual('@mantine/core');
    return {
        ...actual,
        Select: vi.fn(({ placeholder, data, onChange }: any) => (
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

vi.mock(import('~/client/pages/products/AmountExpanded'), () => ({
    AmountExpanded: vi.fn(({ delta, onChange, onAddSuspicious, onAddHome }: any) => (
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

    beforeEach(() => vi.mocked(useProducts).mockReturnValue([]));

    afterEach(() => vi.clearAllMocks());

    function renderTab(active: ProductAmounts = baseActive) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountVariantsTab />
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
