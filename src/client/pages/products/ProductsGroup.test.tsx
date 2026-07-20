import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductRow } from '~/client/pages/products/ProductRow';
import { ProductsGroup } from '~/client/pages/products/ProductsGroup';
import { useYears } from '~/client/state/years/useYears';
import type { Group, Product } from '~/types/data';

vi.mock(import('~/client/state/years/useYears'), () => ({
    useYears: vi.fn(() => [2024, 2025, 2026]),
}));

vi.mock(import('~/client/filters/hooks/useGroupFilterPredicate'), () => ({
    useGroupFilterPredicate: vi.fn(() => () => true),
}));

vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(() => () => true),
}));

vi.mock(import('~/client/pages/products/MissingOnlyContext'), () => ({
    useMissingOnly: vi.fn(() => [false, vi.fn()]),
}));

vi.mock(import('~/client/pages/products/ProductRow'), () => ({
    ProductRow: vi.fn(({ product, hidden }: any) => (
        <tr data-testid="product-row" data-name={product.name} data-hidden={String(hidden)} />
    )),
}));

vi.mock(import('~/client/table/GroupTitle'), () => ({
    GroupTitle: vi.fn(({ children, hidden }: any) => (
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
        vi.mocked(useGroupFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useMissingOnly).mockReturnValue([false, vi.fn()]);
        vi.mocked(useYears).mockReturnValue([2024, 2025, 2026]);
    });

    afterEach(() => vi.clearAllMocks());

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

        const annuals = vi.mocked(ProductRow).mock.calls.map(([props]: any[]) => props.annual);

        expect(annuals.length).toBeGreaterThan(0);
        expect(annuals.every((a: boolean) => a)).toBe(true);
    });

    it('passes annual=false when group.annual is false', () => {
        renderGroup({ ...group, annual: false });

        const annuals = vi.mocked(ProductRow).mock.calls.map(([props]: any[]) => props.annual);

        expect(annuals.every((a: boolean) => !a)).toBe(true);
    });

    it('sets hidden=false when groupFilter passes and products match quickFilter', () => {
        renderGroup();

        const title = screen.getByTestId('group-title');

        expect(title.getAttribute('data-hidden')).toBe('false');
    });

    it('sets hidden=true when groupFilter returns false for this group', () => {
        vi.mocked(useGroupFilterPredicate).mockReturnValue(() => false);

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('true');

        const hiddenStates = screen.getAllByTestId('product-row').map((r) => r.getAttribute('data-hidden'));

        expect(hiddenStates.every((h) => h === 'true')).toBe(true);
    });

    it('sets hidden=true when no products pass quickFilter', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => false);

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('true');
    });

    it('sets hidden=false when at least one product passes quickFilter', () => {
        // Only 'Avietės' passes the quick filter
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Avietės');

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('false');
    });

    it('hides individual product rows that do not pass quickFilter', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Avietės');

        renderGroup();

        const rows = screen.getAllByTestId('product-row');
        const avietesRow = rows.find((r) => r.getAttribute('data-name') === 'Avietės')!;
        const braskesRow = rows.find((r) => r.getAttribute('data-name') === 'Braškės')!;

        expect(avietesRow.getAttribute('data-hidden')).toBe('false');
        expect(braskesRow.getAttribute('data-hidden')).toBe('true');
    });

    it('sets hidden=true for the group when missingOnly=true and no products have missing=true', () => {
        vi.mocked(useMissingOnly).mockReturnValue([true, vi.fn()]);
        // Neither product has missing=true

        renderGroup();

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('true');
    });

    it('sets hidden=false for the group when missingOnly=true and at least one product has missing=true', () => {
        vi.mocked(useMissingOnly).mockReturnValue([true, vi.fn()]);
        const productsWithMissing: Product[] = [
            { group: 'Uogienės', name: 'Avietės', missing: true },
            { group: 'Uogienės', name: 'Braškės', missing: false },
        ];

        renderGroup(group, productsWithMissing);

        expect(screen.getByTestId('group-title').getAttribute('data-hidden')).toBe('false');
    });

    it('hides individual product rows where missing=false when missingOnly=true', () => {
        vi.mocked(useMissingOnly).mockReturnValue([true, vi.fn()]);
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

        const passedNames = vi.mocked(ProductRow).mock.calls.map(([props]: any[]) => props.product.name);

        expect(passedNames).toContain('Avietės');
        expect(passedNames).toContain('Braškės');
    });
});
