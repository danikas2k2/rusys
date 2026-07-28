import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductRow } from '~/client/pages/products/ProductRow';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';

vi.mock(import('~/client/state/years/useYears'));
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
vi.mock(import('~/client/common/AmountViewToggle'), () => ({
    AmountViewToggle: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/pages/products/ProductRow'), () => ({
    ProductRow: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/state/groups/useGroups'), () => ({
    useGroups: vi.fn(),
}));
vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<ProductsTable>', () => {
    const products = getProductsFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        products,
    };

    const uogienesProducts = products.filter((p) => p.group === 'Uogienės');

    beforeEach(() => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useGroups).mockReturnValue(state.groups);
        vi.mocked(useProducts).mockReturnValue(products);
        vi.mocked(useYears).mockReturnValue(state.years);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
    });

    afterEach(() => vi.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();

            const row = within(screen.getByRole('row'));

            expect(row.getAllByRole('columnheader')).toHaveListWithTextContent(['', '23', '22', '21']);

            expect(ProductRow).toHaveBeenCalledTimes(uogienesProducts.length);
        });

        it('renders only the rows for the selected group', () => {
            vi.mocked(useGroupFilter).mockReturnValueOnce(['Daržovės', vi.fn()]);
            const darzovesProducts = products.filter((p) => p.group === 'Daržovės');

            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(ProductRow).toHaveBeenCalledTimes(darzovesProducts.length);
        });

        it('renders no rows when the selected group has no products', () => {
            vi.mocked(useProducts).mockReturnValue([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(ProductRow).not.toHaveBeenCalled();
        });

        it('passes the selected group annual flag to rows', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            const uogienesGroup = state.groups.find((g) => g.group === 'Uogienės');

            expect(ProductRow).toHaveBeenCalledWith(
                expect.objectContaining({ annual: uogienesGroup?.annual }),
                undefined
            );
        });

        it('does not render table for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            vi.mocked(useProductsHasData).mockReturnValueOnce(false);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('loader', () => {
        it('does not render loader for complete state', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('renders loader for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            vi.mocked(useProductsHasData).mockReturnValueOnce(false);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
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
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });
    });
});
