import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { getProductsFixture } from '@tests/fixtures';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { ReviewProductRow } from '~/features/review/ReviewProductRow';
import { getId } from '~/lib/utils/id';

describe('<ReviewProductRow>', () => {
    let user: UserEvent;
    const products = getProductsFixture();
    const onToggle = vi.fn();

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => vi.clearAllMocks());

    function renderRow(product = products[0], checked = false, touched = true, hidden = false) {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <ReviewProductRow
                            product={product}
                            checked={checked}
                            touched={touched}
                            onToggle={onToggle}
                            hidden={hidden}
                        />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );
    }

    it('renders unchecked and enabled by default', () => {
        renderRow(products[0]);

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeEnabled();
        expect(checkbox).not.toBeChecked();
        expect(screen.getByText(products[0].name)).toBeInTheDocument();
        expect(screen.getByText(products[0].name.charAt(0))).toBeInTheDocument();
    });

    it('renders the product image beside its title when one is available', () => {
        const product = { ...products[0], image: '/images/products/avietes.png' };
        renderRow(product);

        expect(document.querySelector('img')).toHaveAttribute('src', product.image);
    });

    it('renders checkbox as checked when checked=true', () => {
        renderRow(products[0], true);

        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls onToggle with the product key and true when checking', async () => {
        renderRow(products[0]);

        await user.click(screen.getByRole('checkbox'));

        expect(onToggle).toHaveBeenCalledWith(getId(products[0].group, products[0].name), true);
    });

    it('calls onToggle with the product key and false when unchecking', async () => {
        renderRow(products[0], true);

        await user.click(screen.getByRole('checkbox'));

        expect(onToggle).toHaveBeenCalledWith(getId(products[0].group, products[0].name), false);
    });

    it('sets data-hidden on the row when hidden', () => {
        renderRow(products[0], false, true, true);

        expect(screen.getByRole('row')).toHaveAttribute('data-hidden', 'true');
    });

    it('marks the checkbox as untouched when the group has not been touched', () => {
        renderRow(products[0], false, false);

        expect(screen.getByRole('checkbox')).toHaveAttribute('data-untouched', 'true');
    });

    it('marks the checkbox as touched when the group has been touched', () => {
        renderRow(products[0], false, true);

        expect(screen.getByRole('checkbox')).toHaveAttribute('data-untouched', 'false');
    });
});
