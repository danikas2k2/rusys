import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { ProductTitle } from '~/client/pages/products/ProductTitle';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/state/products/useSetProductMissing', () => ({
    useSetProductMissing: jest.fn(),
}));
jest.mock('~/client/state/profile/useProfile');
jest.mock('~/client/state/years/useYears');

describe('<ProductTitle>', () => {
    const user = userEvent.setup();
    const products = getProductsFixture();
    const years = getYearsFixture();

    const setMissing = jest.fn();

    beforeEach(() => {
        jest.mocked(useYears).mockReturnValue(years);
        jest.mocked(useSetProductMissing).mockReturnValue(setMissing);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function renderTitle(product = products[0]) {
        render(
            <MockApp>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <ProductTitle product={product} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockApp>
        );
    }

    it('renders available product checkbox as checked and enabled', () => {
        renderTitle(products[0]);

        expect(screen.getByRole('checkbox')).toBeEnabled().toBeChecked();
        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-available', 'true');
    });

    it('renders missing product checkbox as unchecked', () => {
        renderTitle({ ...products[0], missing: true });

        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('disables checkbox and sets indeterminate for unavailable product', () => {
        renderTitle({ ...products[0], years: [] });

        expect(screen.getByRole('checkbox')).toBeDisabled().toBePartiallyChecked();
        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-available', 'false');
    });

    it('marks removing state when any year is removing', () => {
        renderTitle({
            ...products[0],
            years: [{ year: years[0], removing: true, amounts: [{ variant: 'p', amount: 1 }] }],
        });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'true');
    });

    it('calls setMissing on toggle when available', async () => {
        renderTitle({ ...products[0], missing: false });

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).toHaveBeenCalledWith(products[0].group, products[0].name, true);
    });

    it('does not call setMissing when unavailable', async () => {
        renderTitle({ ...products[0], years: [] });

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).not.toHaveBeenCalled();
    });
});
