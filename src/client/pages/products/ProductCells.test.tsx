import { render, screen } from '@testing-library/react';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockTableRow } from '@tests/MockTableRow';

import React from 'react';

import { ProductCell } from '~/client/pages/products/ProductCell';
import { ProductCells } from '~/client/pages/products/ProductCells';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/pages/products/ProductCell', () => ({
    ProductCell: jest.fn(() => <td />),
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

    it('renders one ProductCell per year when annual is true', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} annual />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(years.length);
        expect(ProductCell)
            .toHaveBeenCalledTimes(years.length)
            .toHaveBeenLastCalledWith(expect.objectContaining({ last: true, year: years.at(-1) }), undefined);
    });

    it('renders single ProductCell with span when annual is false', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} annual={false} />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(1);
        expect(ProductCell)
            .toHaveBeenCalledTimes(1)
            .toHaveBeenCalledWith(expect.objectContaining({ span: years.length }), undefined);
    });
});
