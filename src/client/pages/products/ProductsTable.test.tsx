import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useMissingProducts } from '~/client/pages/products/hooks/useMissingProducts';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductsGroups } from '~/client/pages/products/ProductsGroups';
import { ProductsTable } from '~/client/pages/products/ProductsTable';

vi.mock('~/client/state/years/useYears');
vi.mock('~/client/filters/hooks/useFilteredList', async () => ({
    useFilteredList: vi.fn(),
}));
vi.mock('~/client/pages/products/hooks/useProductsHasData', async () => ({
    useProductsHasData: vi.fn().mockReturnValue(true),
}));
vi.mock('~/client/pages/products/MissingOnlyContext', async () => ({
    useMissingOnly: vi.fn().mockReturnValue([false, vi.fn()]),
}));
vi.mock('~/client/hooks/useLockingLoader', async () => ({
    ...(await vi.importActual('~/client/hooks/useLockingLoader')),
    useLockingLoader: vi.fn(),
}));
vi.mock('~/client/filters/QuickFilterContext', async () => ({
    useQuickFilterContext: vi.fn(),
}));
vi.mock('~/client/filters/hooks/useGroupFilter', async () => ({
    useGroupFilter: vi.fn(),
}));
vi.mock('~/client/pages/products/hooks/useMissingProducts', async () => ({
    useMissingProducts: vi.fn().mockReturnValue([]),
}));
vi.mock('~/client/pages/products/MissingOnlyCheckbox', async () => ({
    MissingOnlyCheckbox: vi.fn(({ onClick }: { onClick: () => void }) => <input type="checkbox" onClick={onClick} />),
}));
vi.mock('~/client/pages/products/ProductsGroups', async () => ({
    ProductsGroups: vi.fn().mockReturnValue(null),
}));

describe('<ProductsTable>', () => {
    const products = getProductsFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        products,
    };

    const setFilter = vi.fn();

    beforeEach(() => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useQuickFilterContext).mockReturnValue(['', setFilter]);
        vi.mocked(useGroupFilter).mockReturnValue('');
        vi.mocked(useFilteredList).mockReturnValue(products);
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

            expect(ProductsGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės', 'Daržovės'],
                    products,
                },
                undefined
            );
        });

        it('renders table for complete state with data filtered-out', () => {
            vi.mocked(useFilteredList).mockReturnValue([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(ProductsGroups).toHaveBeenCalledWith({ groups: [], products: [] }, undefined);
        });

        it('renders table with group selected', () => {
            vi.mocked(useGroupFilter).mockReturnValue('Uogienės');
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(ProductsGroups).toHaveBeenCalledWith(
                { groups: ['Uogienės'], products: expect.any(Array) },
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
        const mockSetFilter = vi.fn();

        beforeEach(() => {
            vi.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
            vi.mocked(useQuickFilterContext).mockReturnValue(['', mockSetFilter]);
        });

        afterEach(() => vi.clearAllMocks());

        it('renders missing only rows if missing state is set', () => {
            vi.mocked(useMissingProducts).mockReturnValueOnce(products.slice(1, 2));
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(ProductsGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės'],
                    products: products.slice(1, 2),
                },
                undefined
            );
        });

        it('clears missing-only state if all missing rows are filtered out', () => {
            vi.mocked(useFilteredList).mockReturnValueOnce(products.slice(2));
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(setMissingOnly).toHaveBeenCalledWith(false);
        });

        it('calls clearFilter on missing-only checkbox being clicked when all missing rows are filtered out', async () => {
            const testSetFilter = vi.fn();
            vi.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
            vi.mocked(useQuickFilterContext).mockReturnValue(['z', testSetFilter]);
            vi.mocked(useFilteredList).mockReturnValue(products);
            vi.mocked(useMissingProducts).mockReturnValue([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).toHaveBeenCalledWith('');
        });

        it('does not call clearFilter when missingOnly is false', async () => {
            const testSetFilter = vi.fn();
            vi.mocked(useMissingOnly).mockReturnValueOnce([false, setMissingOnly]);
            vi.mocked(useQuickFilterContext).mockReturnValueOnce(['z', testSetFilter]);
            vi.mocked(useFilteredList).mockReturnValueOnce([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).not.toHaveBeenCalled();
        });

        it('does not call clearFilter when filter is empty', async () => {
            const testSetFilter = vi.fn();
            vi.mocked(useQuickFilterContext).mockReturnValueOnce(['', testSetFilter]);
            vi.mocked(useFilteredList).mockReturnValueOnce([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).not.toHaveBeenCalled();
        });

        it('does not call clearFilter when hasMissingProduct is true', async () => {
            const testSetFilter = vi.fn();
            vi.mocked(useQuickFilterContext).mockReturnValueOnce(['z', testSetFilter]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).not.toHaveBeenCalled();
        });
    });
});
