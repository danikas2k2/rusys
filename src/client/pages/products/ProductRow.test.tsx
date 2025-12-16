import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { ProductRow } from '~/client/pages/products/ProductRow';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/state/products/useSetProductMissing', () => ({
    useSetProductMissing: jest.fn(),
}));
jest.mock('~/client/state/products/useSetProductRemoving', () => ({
    useSetProductRemoving: jest.fn(),
}));
jest.mock('~/client/state/profile/useProfile');
jest.mock('~/client/state/years/useYears');

describe('<ProductRow>', () => {
    const user = userEvent.setup();
    const products = getProductsFixture();
    const product = products[0];
    const years = getYearsFixture();

    const setMissing = jest.fn();
    const setRemoving = jest.fn();

    beforeEach(() => {
        jest.mocked(useYears).mockReturnValue(years);
        jest.mocked(useSetProductMissing).mockReturnValue(setMissing);
        jest.mocked(useSetProductRemoving).mockReturnValue(setRemoving);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a row with title and cells', () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={product} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getByRole('row')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getAllByRole('cell')).toHaveLength(years.length + 1);
    });

    it('hides row when hidden flag is set', () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={product} hidden />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getByRole('row')).toHaveAttribute('data-hidden', 'true');
    });

    it('toggles missing on checkbox click', async () => {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <ProductRow product={{ ...product, missing: false }} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).toHaveBeenCalledWith(product.group, product.name, true);
    });
});
