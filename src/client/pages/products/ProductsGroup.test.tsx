import { render, screen } from '@testing-library/react';
import { Table } from '@mantine/core';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ProductsGroup } from '~/client/pages/products/ProductsGroup';
import type { Group, Product } from '~/types/data';

jest.mock('~/client/state/years/useYears', () => ({
    useYears: jest.fn(() => [2024, 2025, 2026]),
}));

jest.mock('~/client/filters/hooks/useGroupFilterPredicate', () => ({
    useGroupFilterPredicate: jest.fn(() => () => true),
}));

jest.mock('~/client/filters/hooks/useQuickFilterPredicate', () => ({
    useQuickFilterPredicate: jest.fn(() => () => true),
}));

jest.mock('~/client/pages/products/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn(() => [false, jest.fn()]),
}));

jest.mock('~/client/pages/products/ProductRow', () => ({
    ProductRow: jest.fn(({ product, hidden }: any) => (
        <tr data-testid="product-row" data-name={product.name} data-hidden={String(hidden)} />
    )),
}));

jest.mock('~/client/table/GroupTitle', () => ({
    GroupTitle: jest.fn(({ children, hidden }: any) => (
        <tbody data-testid="group-title" data-hidden={String(hidden)}>
            <tr>
                <th>{children}</th>
            </tr>
        </tbody>
    )),
}));

describe('<ProductsGroup>', () => {
    const group: Group = { group: 'Uogienės', order: 1, annual: true };
    const products: Product[] = [
        { group: 'Uogienės', name: 'Avietės' },
        { group: 'Uogienės', name: 'Braškės' },
        { group: 'Sultys', name: 'Obuoliai' }, // different group — should be excluded
    ];

    beforeEach(() => {
        const { useGroupFilterPredicate } = jest.requireMock('~/client/filters/hooks/useGroupFilterPredicate');
        useGroupFilterPredicate.mockReturnValue(() => true);
        const { useQuickFilterPredicate } = jest.requireMock('~/client/filters/hooks/useQuickFilterPredicate');
        useQuickFilterPredicate.mockReturnValue(() => true);
        const { useMissingOnly } = jest.requireMock('~/client/pages/products/MissingOnlyContext');
        useMissingOnly.mockReturnValue([false, jest.fn()]);
        const { useYears } = jest.requireMock('~/client/state/years/useYears');
        useYears.mockReturnValue([2024, 2025, 2026]);
    });

    afterEach(() => jest.clearAllMocks());

    function renderGroup(g = group, p = products) {
        return render(
            <MockTheme>
                <Table>
                    <ProductsGroup group={g} products={p} />
                </Table>
            </MockTheme>
        );
    }

    it('renders GroupTitle with the group name', () => {
        renderGroup();

        expect(screen.getByTestId('group-title')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
    });

    it('renders only products that belong to the group', () => {
        renderGroup();

        const rows = screen.getAllByTestId('product-row');
        expect(rows).toHaveLength(2);
        const names = rows.map((r) => r.getAttribute('data-name'));
        expect(names).toContain('Avietės');
        expect(names).toContain('Braškės');
        expect(names).not.toContain('Obuoliai');
    });

    it('passes annual from group to each ProductRow', () => {
        renderGroup();

        const { ProductRow } = jest.requireMock('~/client/pages/products/ProductRow');
        const calls = ProductRow.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        calls.forEach(([props]: any[]) => {
            expect(props.annual).toBe(true);
        });
    });

    it('passes annual=false when group.annual is false', () => {
        renderGroup({ ...group, annual: false });

        const { ProductRow } = jest.requireMock('~/client/pages/products/ProductRow');
        ProductRow.mock.calls.forEach(([props]: any[]) => {
            expect(props.annual).toBe(false);
        });
    });

    it('sets hidden=false when groupFilter passes and products match quickFilter', () => {
        renderGroup();

        const title = screen.getByTestId('group-title');
        expect(title.getAttribute('data-hidden')).toBe('false');
    });

    it('sets hidden=true when groupFilter returns false for this group', () => {
        const { useGroupFilterPredicate } = jest.requireMock(
            '~/client/filters/hooks/useGroupFilterPredicate'
        );
        useGroupFilterPredicate.mockReturnValue(() => false);

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('true');
        screen.getAllByTestId('product-row').forEach((row) => {
            expect(row.getAttribute('data-hidden')).toBe('true');
        });
    });

    it('sets hidden=true when no products pass quickFilter', () => {
        const { useQuickFilterPredicate } = jest.requireMock(
            '~/client/filters/hooks/useQuickFilterPredicate'
        );
        useQuickFilterPredicate.mockReturnValue(() => false);

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('true');
    });

    it('sets hidden=false when at least one product passes quickFilter', () => {
        const { useQuickFilterPredicate } = jest.requireMock(
            '~/client/filters/hooks/useQuickFilterPredicate'
        );
        // Only 'Avietės' passes the quick filter
        useQuickFilterPredicate.mockReturnValue((name: string) => name === 'Avietės');

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('false');
    });

    it('hides individual product rows that do not pass quickFilter', () => {
        const { useQuickFilterPredicate } = jest.requireMock(
            '~/client/filters/hooks/useQuickFilterPredicate'
        );
        useQuickFilterPredicate.mockReturnValue((name: string) => name === 'Avietės');

        renderGroup();

        const rows = screen.getAllByTestId('product-row');
        const avietesRow = rows.find((r) => r.getAttribute('data-name') === 'Avietės')!;
        const braskesRow = rows.find((r) => r.getAttribute('data-name') === 'Braškės')!;

        expect(avietesRow.getAttribute('data-hidden')).toBe('false');
        expect(braskesRow.getAttribute('data-hidden')).toBe('true');
    });

    it('sets hidden=true for the group when missingOnly=true and no products have missing=true', () => {
        const { useMissingOnly } = jest.requireMock('~/client/pages/products/MissingOnlyContext');
        useMissingOnly.mockReturnValue([true, jest.fn()]);
        // Neither product has missing=true

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('true');
    });

    it('sets hidden=false for the group when missingOnly=true and at least one product has missing=true', () => {
        const { useMissingOnly } = jest.requireMock('~/client/pages/products/MissingOnlyContext');
        useMissingOnly.mockReturnValue([true, jest.fn()]);
        const productsWithMissing: Product[] = [
            { group: 'Uogienės', name: 'Avietės', missing: true },
            { group: 'Uogienės', name: 'Braškės', missing: false },
        ];

        renderGroup(group, productsWithMissing);

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('false');
    });

    it('hides individual product rows where missing=false when missingOnly=true', () => {
        const { useMissingOnly } = jest.requireMock('~/client/pages/products/MissingOnlyContext');
        useMissingOnly.mockReturnValue([true, jest.fn()]);
        const productsWithMissing: Product[] = [
            { group: 'Uogienės', name: 'Avietės', missing: true },
            { group: 'Uogienės', name: 'Braškės', missing: false },
        ];

        renderGroup(group, productsWithMissing);

        const rows = screen.getAllByTestId('product-row');
        const avietesRow = rows.find((r) => r.getAttribute('data-name') === 'Avietės')!;
        const braskesRow = rows.find((r) => r.getAttribute('data-name') === 'Braškės')!;

        expect(avietesRow.getAttribute('data-hidden')).toBe('false');
        expect(braskesRow.getAttribute('data-hidden')).toBe('true');
    });

    it('renders no product rows when the group has no matching products', () => {
        const noMatchProducts: Product[] = [{ group: 'Sultys', name: 'Obuoliai' }];

        renderGroup(group, noMatchProducts);

        expect(screen.queryAllByTestId('product-row')).toHaveLength(0);
    });

    it('passes the correct product object to each ProductRow', () => {
        renderGroup();

        const { ProductRow } = jest.requireMock('~/client/pages/products/ProductRow');
        const passedNames = ProductRow.mock.calls.map(([props]: any[]) => props.product.name);
        expect(passedNames).toContain('Avietės');
        expect(passedNames).toContain('Braškės');
    });
});
