import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useProductsHasData } from '~/client/pages/products/hooks/useProductsHasData';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductsGroup } from '~/client/pages/products/ProductsGroup';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/filters/hooks/useFilteredList', () => ({
    useFilteredList: jest.fn(),
}));
jest.mock('~/client/pages/products/hooks/useProductsHasData', () => ({
    useProductsHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/pages/products/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn().mockReturnValue([false, jest.fn()]),
}));
jest.mock('~/client/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/client/filters/QuickFilterContext', () => ({
    useQuickFilter: jest.fn(),
}));
jest.mock('~/client/pages/products/MissingOnlyCheckbox', () => ({
    MissingOnlyCheckbox: jest.fn(() => <input type="checkbox" />),
}));
jest.mock('~/client/pages/products/ProductsGroup', () => ({
    ProductsGroup: jest.fn().mockReturnValue(null),
}));
jest.mock('~/client/state/groups/useGroups', () => ({
    useGroups: jest.fn(),
}));
jest.mock('~/client/state/products/useProducts', () => ({
    useProducts: jest.fn(),
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
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        jest.mocked(useQuickFilter).mockReturnValue(['', jest.fn()]);
        jest.mocked(useGroups).mockReturnValue(state.groups);
        jest.mocked(useProducts).mockReturnValue(products);
        jest.mocked(useFilteredList).mockReturnValue(products);
        jest.mocked(useYears).mockReturnValue(state.years);
    });

    afterEach(() => jest.clearAllMocks());

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
            jest.mocked(useFilteredList).mockReturnValue([]);
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
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
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
            jest.mocked(useProductsHasData).mockReturnValueOnce(false);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
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
            jest.mocked(useProductsHasData).mockReturnValueOnce(false);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
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
        const setMissingOnly = jest.fn();
        const mockSetFilter = jest.fn();

        beforeEach(() => {
            jest.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
            jest.mocked(useQuickFilter).mockReturnValue(['', mockSetFilter]);
        });

        afterEach(() => jest.clearAllMocks());

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
