import { render, screen } from '@testing-library/react';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Table } from '@mantine/core';

import { ProductCell } from '~/client/pages/products/ProductCell';
import { ProductCells } from '~/client/pages/products/ProductCells';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/pages/products/ProductCell', () => ({
    ValueCell: jest.fn(() => <td data-testid="value-cell" />),
}));
jest.mock('~/client/state/years/useYears');

describe('<ProductCells>', () => {
    const products = getProductsFixture();
    const product = products[0];
    const years = getYearsFixture();

    beforeEach(() => {
        jest.mocked(useYears).mockReturnValue(years);
        jest.mocked(ProductCell).mockClear();
    });

    const renderCells = (annual = true) =>
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <ProductCells product={product} annual={annual} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

    it('renders one ProductCell per year when annual is true', () => {
        renderCells(true);

        expect(ProductCell).toHaveBeenCalledTimes(years.length);
        expect(screen.getAllByTestId('value-cell')).toHaveLength(years.length);
        expect(jest.mocked(ProductCell).mock.calls.at(-1)?.[0]).toStrictEqual(
            expect.objectContaining({ last: true, year: years.at(-1) })
        );
    });

    it('renders single ProductCell with span when annual is false', () => {
        renderCells(false);

        expect(ProductCell).toHaveBeenCalledTimes(1);
        expect(ProductCell).toHaveBeenCalledWith(expect.objectContaining({ span: years.length }), undefined);
        expect(screen.getAllByTestId('value-cell')).toHaveLength(1);
    });
});
