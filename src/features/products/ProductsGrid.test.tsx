import { act, render } from '@testing-library/react';
import { getGroupsFixture, getProductsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/features/products/MissingOnlyContext';
import { ProductsGrid } from '~/features/products/ProductsGrid';
import { ProductTile, type ProductTileProps } from '~/features/products/ProductTile';
import { useGroups } from '~/store/groups';
import { useProducts } from '~/store/products';

vi.mock(import('~/features/products/hooks/useProductsHasData'), () => ({
    useProductsHasData: vi.fn().mockReturnValue(true),
}));
vi.mock(import('~/features/products/MissingOnlyContext'), () => ({
    useMissingOnly: vi.fn().mockReturnValue([false, vi.fn()]),
}));
vi.mock(import('~/components/common/LoadableContent'), () => ({
    LoadableContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
vi.mock(import('~/features/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));
vi.mock(import('~/features/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));
vi.mock(import('~/features/products/ProductTile'), () => ({
    ProductTile: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/store/groups/useGroups'), () => ({
    useGroups: vi.fn(),
}));
vi.mock(import('~/store/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<ProductsGrid>', () => {
    const products = getProductsFixture();
    const state = { groups: getGroupsFixture(), products };
    const uogienesProducts = products.filter((p) => p.group === 'Uogienės');

    beforeEach(() => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useGroups).mockReturnValue(state.groups);
        vi.mocked(useProducts).mockReturnValue(products);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders one tile per product in the selected group', () => {
        render(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );

        expect(ProductTile).toHaveBeenCalledTimes(uogienesProducts.length);
    });

    it('renders only tiles for the selected group', () => {
        vi.mocked(useGroupFilter).mockReturnValueOnce(['Daržovės', vi.fn()]);
        const darzovesProducts = products.filter((p) => p.group === 'Daržovės');

        render(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );

        expect(ProductTile).toHaveBeenCalledTimes(darzovesProducts.length);
    });

    it('renders no tiles when the selected group has no products', () => {
        vi.mocked(useProducts).mockReturnValue([]);

        render(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );

        expect(ProductTile).not.toHaveBeenCalled();
    });

    it('passes the selected group annual flag to tiles', () => {
        render(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );

        const uogienesGroup = state.groups.find((g) => g.group === 'Uogienės');

        expect(ProductTile).toHaveBeenCalledWith(expect.objectContaining({ annual: uogienesGroup?.annual }), undefined);
    });

    it('updates existing tiles on the next animation frame when membership stays the same', () => {
        let frame: FrameRequestCallback | undefined;
        const request = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            frame = callback;
            return 1;
        });
        const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
        const first = { group: 'Uogienės', name: 'Braškės', missing: false };
        const updated = { ...first, missing: true };
        vi.mocked(useProducts).mockReturnValueOnce([first]).mockReturnValue([updated]);

        const view = render(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );
        view.rerender(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );

        expect(request).toHaveBeenCalledWith(expect.any(Function));

        act(() => frame?.(0));

        expect(ProductTile).toHaveBeenLastCalledWith(expect.objectContaining({ product: updated }), undefined);

        view.unmount();

        expect(cancel).toHaveBeenCalledWith(1);

        request.mockRestore();
        cancel.mockRestore();
    });

    it('delays changed product membership until the dialog exit completes', () => {
        vi.useFakeTimers();
        try {
            const first = { group: 'Uogienės', name: 'Braškės' };
            const added = { group: 'Uogienės', name: 'Avietės' };
            vi.mocked(useProducts).mockReturnValueOnce([first]).mockReturnValue([first, added]);
            const view = render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );
            view.rerender(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            expect(vi.mocked(ProductTile).mock.calls.some(([props]) => props.product === added)).toBe(false);

            act(() => vi.advanceTimersByTime(220));

            expect(vi.mocked(ProductTile).mock.calls.some(([props]) => props.product === added)).toBe(true);

            view.unmount();
        } finally {
            vi.useRealTimers();
        }
    });

    describe('tree', () => {
        const parentProduct = {
            group: 'Uogienės',
            name: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
        };
        const childProduct = {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
            years: [{ year: 22, amounts: [{ variant: 'p', amount: 3 }] }],
        };

        beforeEach(() => {
            vi.mocked(useProducts).mockReturnValue([parentProduct, childProduct]);
        });

        it('renders the parent collapsed with a rolled-up total, and its child kept mounted (but hidden)', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            // Children stay mounted while collapsed (see ProductGridNode.children) so expanding
            // can animate smoothly instead of the panel just appearing - see the 'frames the
            // expanded children' test below for the actual hidden-vs-visible check.
            expect(ProductTile).toHaveBeenCalledTimes(2);
            expect(ProductTile).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    product: parentProduct,
                    hasChildren: true,
                    expanded: false,
                    totalAmounts: [{ variant: 'p', amount: 5 }],
                }),
                undefined
            );
            expect(ProductTile).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ product: childProduct, hasChildren: false }),
                undefined
            );
        });

        it('reveals the child tile and stops rolling up once expanded', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            const { onToggleExpand } = vi.mocked(ProductTile).mock.calls[0][0];
            vi.mocked(ProductTile).mockClear();

            act(() => onToggleExpand!());

            expect(ProductTile).toHaveBeenCalledTimes(2);
            expect(ProductTile).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    product: parentProduct,
                    expanded: true,
                    totalAmounts: [{ variant: 'p', amount: 2 }],
                }),
                undefined
            );
            expect(ProductTile).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ product: childProduct, hasChildren: false }),
                undefined
            );
        });

        it('frames the expanded children in a panel, hidden (not removed) while collapsed', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            // Kept in the DOM rather than unmounted, so the expand/collapse can animate - Mantine's
            // Collapse marks the hidden state via aria-hidden on its own wrapper (the panel's
            // direct parent) rather than actually running the height transition in jsdom.
            const getWrapper = () => document.querySelector('[data-children-panel]')!.parentElement;

            expect(getWrapper()).toHaveAttribute('aria-hidden', 'true');

            const { onToggleExpand } = vi.mocked(ProductTile).mock.calls[0][0];
            act(() => onToggleExpand!());

            expect(getWrapper()).toHaveAttribute('aria-hidden', 'false');
        });

        it('collapses back to a single rolled-up tile on a second toggle', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            const { onToggleExpand } = vi.mocked(ProductTile).mock.calls[0][0];
            act(() => onToggleExpand!());
            vi.mocked(ProductTile).mockClear();

            act(() => onToggleExpand!());

            expect(ProductTile).toHaveBeenCalledTimes(2);
            expect(ProductTile).toHaveBeenNthCalledWith(1, expect.objectContaining({ expanded: false }), undefined);
        });

        it('shows a matching child as a root when its collapsed parent does not match the search', () => {
            vi.mocked(useQuickFilterPredicate).mockReturnValue((name) => name.includes('Zewa'));

            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            expect(ProductTile).toHaveBeenCalledTimes(1);
            expect(ProductTile).toHaveBeenCalledWith(
                expect.objectContaining({ product: childProduct, totalAmounts: [{ variant: 'p', amount: 3 }] }),
                undefined
            );
            expect(document.querySelector('[data-children-panel]')).not.toBeInTheDocument();
        });

        it('keeps a matching child nested when its parent also matches the search', () => {
            vi.mocked(useQuickFilterPredicate).mockReturnValue((name) => name.includes('Avietės'));

            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            expect(ProductTile).toHaveBeenCalledTimes(2);
            expect(document.querySelector('[data-children-panel]')?.parentElement).toHaveAttribute(
                'aria-hidden',
                'true'
            );
        });
    });

    describe('missing-only', () => {
        const setMissingOnly = vi.fn();

        beforeEach(() => {
            vi.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
        });

        afterEach(() => vi.clearAllMocks());

        it('omits non-missing products when missing-only is active', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            const avietesCall = vi
                .mocked(ProductTile)
                .mock.calls.find(([props]: [ProductTileProps]) => props.product.name === 'Avietės');
            const braskesCall = vi
                .mocked(ProductTile)
                .mock.calls.find(([props]: [ProductTileProps]) => props.product.name === 'Braškės');

            expect(avietesCall).toBeUndefined();
            expect(braskesCall).toBeDefined();
        });

        it('shows a missing child independently when its parent is available', () => {
            const parent = { group: 'Uogienės', name: 'Avietės', missing: false };
            const child = { group: 'Uogienės', name: 'Avietės (Zewa)', parent: 'Avietės', missing: true };
            vi.mocked(useProducts).mockReturnValue([parent, child]);

            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            expect(ProductTile).toHaveBeenCalledTimes(1);
            expect(ProductTile).toHaveBeenCalledWith(expect.objectContaining({ product: child }), undefined);
            expect(document.querySelector('[data-children-panel]')).not.toBeInTheDocument();
        });
    });
});
