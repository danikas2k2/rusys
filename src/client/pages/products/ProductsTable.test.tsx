import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductsGroup } from '~/client/pages/products/ProductsGroup';
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
vi.mock(import('~/client/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn(),
}));
vi.mock(import('~/client/pages/products/MissingOnlyCheckbox'), () => ({
    MissingOnlyCheckbox: vi.fn(() => <input type="checkbox" />),
}));
vi.mock(import('~/client/pages/products/ProductsGroup'), () => ({
    ProductsGroup: vi.fn().mockReturnValue(null),
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

    beforeEach(() => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useQuickFilter).mockReturnValue(['', vi.fn()]);
        vi.mocked(useGroups).mockReturnValue(state.groups);
        vi.mocked(useProducts).mockReturnValue(products);
        vi.mocked(useYears).mockReturnValue(state.years);
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

            expect(ProductsGroup).toHaveBeenCalledTimes(state.groups.length);
            expect(ProductsGroup).toHaveBeenCalledWith({ group: state.groups[0], products }, undefined);
        });

        it('renders table for complete state with data filtered-out', () => {
            vi.mocked(useProducts).mockReturnValue([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(ProductsGroup).toHaveBeenCalledTimes(state.groups.length);
        });

        it('renders table with group selected', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <ProductsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(ProductsGroup).toHaveBeenCalledWith({ group: state.groups[0], products }, undefined);
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
            vi.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
            vi.mocked(useQuickFilter).mockReturnValue(['', mockSetFilter]);
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
