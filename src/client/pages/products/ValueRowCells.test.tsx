import { render, screen } from '@testing-library/react';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Table } from '@mantine/core';

import { ValueRowCells } from '~/client/pages/products/ValueRowCells';
import { ValueCell } from '~/client/pages/products/ValueCell';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/pages/products/ValueCell', () => ({
    ValueCell: jest.fn(() => <td data-testid="value-cell" />),
}));
jest.mock('~/client/state/years/useYears');

describe('<ValueRowCells>', () => {
    const products = getProductsFixture();
    const product = products[0];
    const years = getYearsFixture();

    beforeEach(() => {
        jest.mocked(useYears).mockReturnValue(years);
        jest.mocked(ValueCell).mockClear();
    });

    const renderCells = (annual = true) =>
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <ValueRowCells product={product} annual={annual} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

    it('renders one ValueCell per year when annual is true', () => {
        renderCells(true);

        expect(ValueCell).toHaveBeenCalledTimes(years.length);
        expect(screen.getAllByTestId('value-cell')).toHaveLength(years.length);
        expect(jest.mocked(ValueCell).mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({ last: true, year: years.at(-1) })
        );
    });

    it('renders single ValueCell with span when annual is false', () => {
        renderCells(false);

        expect(ValueCell).toHaveBeenCalledTimes(1);
        expect(ValueCell).toHaveBeenCalledWith(expect.objectContaining({ span: years.length }), undefined);
        expect(screen.getAllByTestId('value-cell')).toHaveLength(1);
    });
});

