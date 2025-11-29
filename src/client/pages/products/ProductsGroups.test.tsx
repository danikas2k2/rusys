import { render, screen } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { Table } from '@mantine/core';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { ProductsGroups } from '~/client/pages/products/ProductsGroups';
import { ValueRow } from '~/client/pages/products/ValueRow';

vi.mock('~/client/filters/hooks/useGroupFilter', async () => ({
    useGroupFilter: vi.fn().mockReturnValue(''),
}));
vi.mock('~/client/pages/products/ValueRow', async () => ({
    ValueRow: vi.fn().mockReturnValue(null),
}));
vi.mock('~/client/table/GroupTitle', async () => ({
    GroupTitle: vi.fn(({ children }: React.PropsWithChildren) => (
        <tbody>
            <tr>
                <th role="rowheader">{children}</th>
            </tr>
        </tbody>
    )),
}));

describe('<ProductsGroups>', () => {
    const groups = ['Uogienės', 'Daržovės'];
    const products = getProductsFixture();
    const state = {
        years: [23, 22, 21],
        groups: [
            { group: 'Uogienės', order: 1, annual: true },
            { group: 'Daržovės', order: 2, annual: true },
        ],
    };

    afterEach(() => vi.clearAllMocks());

    it('renders products groups with groups and products', () => {
        render(
            <MockThemeRedux state={state}>
                <Table>
                    <ProductsGroups groups={groups} products={products} />
                </Table>
            </MockThemeRedux>
        );

        // Each group renders 2 tbody: one for GroupTitle, one for products
        expect(screen.getAllByRole('rowgroup')).toHaveLength(4);
        expect(screen.getAllByRole('rowheader')).toHaveListWithTextContent(groups);

        expect(ValueRow)
            .toHaveBeenCalledTimes(4)
            .toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Braškės',
                    missing: true,
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                4,
                expect.objectContaining({
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                }),
                undefined
            );
    });

    it('renders filtered groups with products', () => {
        const [group] = groups;
        vi.mocked(useGroupFilter).mockReturnValue(group);
        render(
            <MockThemeRedux state={state}>
                <Table>
                    <ProductsGroups groups={[group]} products={products} />
                </Table>
            </MockThemeRedux>
        );

        expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
        expect(screen.getByRole('rowheader')).toHaveTextContent(group);

        expect(ValueRow)
            .toHaveBeenCalledTimes(2)
            .toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Braškės',
                    missing: true,
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            );
    });

    const missing = 'Šaldytos';

    it('renders missing group without products', () => {
        render(
            <MockThemeRedux state={state}>
                <Table>
                    <ProductsGroups groups={[missing]} products={products} />
                </Table>
            </MockThemeRedux>
        );

        expect(screen.queryByRole('rowgroup')).not.toBeInTheDocument();
        expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
        expect(ValueRow).not.toHaveBeenCalled();
    });

    it('renders missing filtered group without products', () => {
        vi.mocked(useGroupFilter).mockReturnValue(missing);
        render(
            <MockThemeRedux state={state}>
                <Table>
                    <ProductsGroups groups={[missing]} products={products} />
                </Table>
            </MockThemeRedux>
        );

        expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
        expect(screen.getByRole('rowheader')).toHaveTextContent(missing);
        expect(ValueRow).not.toHaveBeenCalled();
    });
});
