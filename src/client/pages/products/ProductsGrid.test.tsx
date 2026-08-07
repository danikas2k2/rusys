import { act, render, screen } from '@testing-library/react';
import { getGroupsFixture, getProductsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductsGrid } from '~/client/pages/products/ProductsGrid';
import { ProductTile } from '~/client/pages/products/ProductTile';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';

vi.mock(import('~/client/pages/products/hooks/useProductsHasData'), () => ({
    useProductsHasData: vi.fn().mockReturnValue(true),
}));
vi.mock(import('~/client/pages/products/MissingOnlyContext'), () => ({
    useMissingOnly: vi.fn().mockReturnValue([false, vi.fn()]),
}));
vi.mock(import('~/client/hooks/useLockingLoader'), async () => ({
    ...(await vi.importActual('~/client/hooks/useLockingLoader')),
    useLockingLoader: vi.fn(),
}));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));
vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));
vi.mock(import('~/client/pages/products/MissingOnlyCheckbox'), () => ({
    MissingOnlyCheckbox: vi.fn(() => <input type="checkbox" />),
}));
vi.mock(import('~/client/pages/products/ProductTile'), () => ({
    ProductTile: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/state/groups/useGroups'), () => ({
    useGroups: vi.fn(),
}));
vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<ProductsGrid>', () => {
    const products = getProductsFixture();
    const state = { groups: getGroupsFixture(), products };
    const uogienesProducts = products.filter((p) => p.group === 'Uogienės');

    beforeEach(() => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
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

    it('does not render for initial state', () => {
        vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);

        render(
            <MockTheme>
                <MockRedux state={state}>
                    <ProductsGrid />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
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

        it('renders only the parent tile by default, collapsed with a rolled-up total', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            expect(ProductTile).toHaveBeenCalledTimes(1);
            expect(ProductTile).toHaveBeenCalledWith(
                expect.objectContaining({
                    product: parentProduct,
                    hasChildren: true,
                    expanded: false,
                    totalAmounts: [{ variant: 'p', amount: 5 }],
                }),
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

            act(() => onToggleExpand());

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

        it('collapses back to a single rolled-up tile on a second toggle', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            const { onToggleExpand } = vi.mocked(ProductTile).mock.calls[0][0];
            act(() => onToggleExpand());
            vi.mocked(ProductTile).mockClear();

            act(() => onToggleExpand());

            expect(ProductTile).toHaveBeenCalledTimes(1);
            expect(ProductTile).toHaveBeenCalledWith(expect.objectContaining({ expanded: false }), undefined);
        });
    });

    describe('missing-only', () => {
        const setMissingOnly = vi.fn();

        beforeEach(() => {
            vi.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
        });

        afterEach(() => vi.clearAllMocks());

        it('renders checkbox in header', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsGrid />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });
    });
});
