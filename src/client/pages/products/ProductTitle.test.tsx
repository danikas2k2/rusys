import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { ProductTitle } from '~/client/pages/products/ProductTitle';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useYears } from '~/client/state/years/useYears';

vi.mock(import('~/client/state/products/useSetProductMissing'), () => ({
    useSetProductMissing: vi.fn(),
}));
vi.mock(import('~/client/state/profile/useProfile'));
vi.mock(import('~/client/state/years/useYears'));

describe('<ProductTitle>', () => {
    const user = userEvent.setup();
    const products = getProductsFixture();
    const years = getYearsFixture();

    const setMissing = vi.fn();

    beforeEach(() => {
        vi.mocked(useYears).mockReturnValue(years);
        vi.mocked(useSetProductMissing).mockReturnValue(setMissing);
    });

    afterEach(() => {
        vi.clearAllMocks();
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

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeEnabled();
        expect(checkbox).toBeChecked();
        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-available', 'true');
    });

    it('renders missing product checkbox as unchecked', () => {
        renderTitle({ ...products[0], missing: true });

        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('disables checkbox and sets indeterminate for unavailable product', () => {
        renderTitle({ ...products[0], years: [] });

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeDisabled();
        expect(checkbox).toBePartiallyChecked();
        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-available', 'false');
    });

    it('marks removing state when any year is removing', () => {
        renderTitle({
            ...products[0],
            years: [{ year: years[0], removing: true, amounts: [{ variant: 'p', amount: 1 }] }],
        });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'true');
    });

    it('sets data-removing to false when product.years is undefined', () => {
        renderTitle({ ...products[0], years: undefined });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'false');
    });

    it('sets data-removing to false when removing year is not in allYears', () => {
        const yearNotInAllYears = 99;
        renderTitle({
            ...products[0],
            years: [{ year: yearNotInAllYears, removing: true, amounts: [{ variant: 'p', amount: 1 }] }],
        });

        expect(screen.getByRole('heading', { level: 5 })).toHaveAttribute('data-removing', 'false');
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

    it('skips setMissing in handleClick when available is false (fireEvent on input)', () => {
        renderTitle({ ...products[0], years: [] });

        // fireEvent.click on the input bypasses userEvent's disabled-check,
        // causing React to invoke onChange → handleClick with available=false
        const input = screen.getByRole('checkbox') as HTMLInputElement;
        fireEvent.click(input);

        expect(setMissing).not.toHaveBeenCalled();
    });

    it('renders an avatar when product has an image', () => {
        renderTitle({ ...products[0], image: '/images/ab/cd/product.png' });

        expect(document.querySelector('img')).toHaveAttribute('src', '/images/ab/cd/product.png');
    });

    it('does not render an avatar when product has no image', () => {
        renderTitle({ ...products[0], image: undefined });

        expect(document.querySelector('img')).not.toBeInTheDocument();
    });
});
