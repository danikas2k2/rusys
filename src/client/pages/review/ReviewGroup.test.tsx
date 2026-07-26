import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { ReviewGroup } from '~/client/pages/review/ReviewGroup';
import { ReviewProductRow } from '~/client/pages/review/ReviewProductRow';
import { getId } from '~/client/utils/id';
import type { Group, Product } from '~/types/data';

vi.mock(import('~/client/filters/hooks/useGroupFilterPredicate'), () => ({
    useGroupFilterPredicate: vi.fn(() => () => true),
}));

vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(() => () => true),
}));

vi.mock(import('~/client/pages/review/ReviewProductRow'), () => ({
    ReviewProductRow: vi.fn(({ product, hidden, checked }: any) => (
        <tr
            data-testid="product-row"
            data-name={product.name}
            data-hidden={String(hidden)}
            data-checked={String(checked)}
        />
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

describe('<ReviewGroup>', () => {
    const group: Group = { group: 'Uogienės', order: 1, review: true };
    const withYears = [{ year: 2024, amounts: [] }];
    const products: Product[] = [
        { group: 'Uogienės', name: 'Avietės', years: withYears },
        { group: 'Uogienės', name: 'Braškės', years: withYears },
        { group: 'Uogienės', name: 'Serbentai', years: [] }, // no recorded stock — should be excluded
        { group: 'Sultys', name: 'Obuoliai', years: withYears }, // different group — should be excluded
    ];
    const onToggle = vi.fn();

    beforeEach(() => {
        vi.mocked(useGroupFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => vi.clearAllMocks());

    function renderGroup(g = group, p = products, checkedKeys: ReadonlySet<string> = new Set()) {
        return render(
            <MockTheme>
                <Table>
                    <ReviewGroup group={g} products={p} checkedKeys={checkedKeys} onToggle={onToggle} />
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

    it('hides individual product rows that do not pass quickFilter', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue((name: string) => name === 'Avietės');

        renderGroup();

        const rows = screen.getAllByTestId('product-row');
        const avietesRow = rows.find((r) => r.getAttribute('data-name') === 'Avietės')!;
        const braskesRow = rows.find((r) => r.getAttribute('data-name') === 'Braškės')!;

        expect(avietesRow.getAttribute('data-hidden')).toBe('false');
        expect(braskesRow.getAttribute('data-hidden')).toBe('true');
    });

    it('does not hide a row just because its key is in checkedKeys', () => {
        const checkedKeys = new Set([getId('Uogienės', 'Braškės')]);

        renderGroup(group, products, checkedKeys);

        const rows = screen.getAllByTestId('product-row');
        const braskesRow = rows.find((r) => r.getAttribute('data-name') === 'Braškės')!;

        expect(braskesRow.getAttribute('data-hidden')).toBe('false');
    });

    it('passes checked=true for rows whose key is in checkedKeys', () => {
        const checkedKeys = new Set([getId('Uogienės', 'Braškės')]);

        renderGroup(group, products, checkedKeys);

        const braskesCalls = vi
            .mocked(ReviewProductRow)
            .mock.calls.filter(([props]: any[]) => props.product.name === 'Braškės');

        expect(braskesCalls[braskesCalls.length - 1][0].checked).toBe(true);
    });

    it('renders no product rows when the group has no matching products', () => {
        const noMatchProducts: Product[] = [{ group: 'Sultys', name: 'Obuoliai', years: withYears }];

        renderGroup(group, noMatchProducts);

        expect(screen.queryAllByTestId('product-row')).toHaveLength(0);
    });

    it('excludes products with no recorded stock from the list', () => {
        renderGroup();

        expect(screen.queryByText('Serbentai')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('product-row').map((r) => r.getAttribute('data-name'))).not.toContain('Serbentai');
    });
});
