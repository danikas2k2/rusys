import { render, screen } from '@testing-library/react';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockTableRow } from '@tests/MockTableRow';

import React from 'react';

import { ProductCell } from '~/client/pages/products/ProductCell';
import { ProductCells } from '~/client/pages/products/ProductCells';
import { useYears } from '~/client/state/years/useYears';

vi.mock(import('~/client/pages/products/ProductCell'), () => ({
    ProductCell: vi.fn(() => <td />),
}));
vi.mock(import('~/client/state/years/useYears'));

describe('<ProductCells>', () => {
    const products = getProductsFixture();
    const product = products[0];
    const years = getYearsFixture();

    beforeEach(() => {
        vi.mocked(useYears).mockReturnValue(years);
        vi.mocked(ProductCell).mockClear();
    });

    it('renders one ProductCell per year when annual is true', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} annual />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(years.length);
        expect(ProductCell).toHaveBeenCalledTimes(years.length);
        expect(ProductCell).toHaveBeenLastCalledWith(
            expect.objectContaining({ last: true, year: years.at(-1) }),
            undefined
        );
    });

    it('passes last=false for non-last years and last=true for the last year', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} annual />
            </MockTableRow>
        );

        const calls = vi.mocked(ProductCell).mock.calls;
        const nonLastCalls = calls.slice(0, calls.length - 1);
        nonLastCalls.forEach(([props]: [React.ComponentProps<typeof ProductCell>, ...unknown[]]) => {
            expect(props).toMatchObject({ last: false });
        });

        expect(calls.at(-1)![0]).toMatchObject({ last: true });
    });

    it('renders single ProductCell with span when annual is false', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} annual={false} />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(1);
        expect(ProductCell).toHaveBeenCalledTimes(1);
        expect(ProductCell).toHaveBeenCalledWith(expect.objectContaining({ span: years.length }), undefined);
    });

    it('defaults annual to false when prop is omitted', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(1);
        expect(ProductCell).toHaveBeenCalledTimes(1);
        expect(ProductCell).toHaveBeenCalledWith(expect.objectContaining({ span: years.length }), undefined);
    });
});
