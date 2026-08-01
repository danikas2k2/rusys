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
        expect(ProductCell).toHaveBeenLastCalledWith(expect.objectContaining({ year: years.at(-1) }), undefined);
    });

    it('passes old=true only for years 4 or more years before the current year', () => {
        const thisYear = new Date().getFullYear() % 100;

        render(
            <MockTableRow>
                <ProductCells product={product} annual />
            </MockTableRow>
        );

        const calls = vi.mocked(ProductCell).mock.calls;
        calls.forEach(([props]: [React.ComponentProps<typeof ProductCell>, ...unknown[]]) => {
            expect(props).toMatchObject({ old: props.year! <= thisYear - 4 });
        });
    });

    it('renders a single ProductCell when annual is false', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} annual={false} />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(1);
        expect(ProductCell).toHaveBeenCalledTimes(1);
        expect(ProductCell).toHaveBeenCalledWith(expect.objectContaining({ product }), undefined);
    });

    it('defaults annual to false when prop is omitted', () => {
        render(
            <MockTableRow>
                <ProductCells product={product} />
            </MockTableRow>
        );

        expect(screen.getAllByRole('cell')).toHaveLength(1);
        expect(ProductCell).toHaveBeenCalledTimes(1);
        expect(ProductCell).toHaveBeenCalledWith(expect.objectContaining({ product }), undefined);
    });

    describe('rolledUpYears prop', () => {
        it('passes the matching year amounts as displayAmounts when annual', () => {
            const rolledUpYears = [{ year: years.at(-1)!, amounts: [{ variant: 'x', amount: 42 }] }];

            render(
                <MockTableRow>
                    <ProductCells product={product} annual rolledUpYears={rolledUpYears} />
                </MockTableRow>
            );

            expect(ProductCell).toHaveBeenLastCalledWith(
                expect.objectContaining({ year: years.at(-1), displayAmounts: [{ variant: 'x', amount: 42 }] }),
                undefined
            );
        });

        it('passes undefined displayAmounts for a year missing from rolledUpYears', () => {
            expect(years[0]).not.toBe(years.at(-1));

            const rolledUpYears = [{ year: years.at(-1)!, amounts: [{ variant: 'x', amount: 42 }] }];

            render(
                <MockTableRow>
                    <ProductCells product={product} annual rolledUpYears={rolledUpYears} />
                </MockTableRow>
            );

            expect(ProductCell).toHaveBeenCalledWith(
                expect.objectContaining({ year: years[0], displayAmounts: undefined }),
                undefined
            );
        });

        it('passes the combined amounts across all rolledUpYears as displayAmounts when not annual', () => {
            const rolledUpYears = [
                { year: 22, amounts: [{ variant: 'x', amount: 3 }] },
                { year: 21, amounts: [{ variant: 'x', amount: 2 }] },
            ];

            render(
                <MockTableRow>
                    <ProductCells product={product} annual={false} rolledUpYears={rolledUpYears} />
                </MockTableRow>
            );

            expect(ProductCell).toHaveBeenCalledWith(
                expect.objectContaining({ displayAmounts: [{ variant: 'x', amount: 5 }] }),
                undefined
            );
        });

        it('does not pass displayAmounts when rolledUpYears is not given', () => {
            render(
                <MockTableRow>
                    <ProductCells product={product} annual={false} />
                </MockTableRow>
            );

            expect(ProductCell).toHaveBeenCalledWith(expect.objectContaining({ displayAmounts: undefined }), undefined);
        });
    });
});
