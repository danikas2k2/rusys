import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { ProductsViewWrapper } from '~/client/common/ProductsViewContext';
import { ProductsViewToggle } from '~/client/common/ProductsViewToggle';

describe('<ProductsViewToggle>', () => {
    it('renders control buttons', () => {
        render(
            <MockApp>
                <ProductsViewWrapper>
                    <ProductsViewToggle />
                </ProductsViewWrapper>
            </MockApp>
        );

        expect(screen.getByRole('radio', { name: 'Tiles' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Table' })).toBeInTheDocument();
    });

    it('renders Tiles as checked by default', () => {
        render(
            <MockApp>
                <ProductsViewWrapper>
                    <ProductsViewToggle />
                </ProductsViewWrapper>
            </MockApp>
        );

        expect(screen.getByRole('radio', { name: 'Tiles' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Table' })).not.toBeChecked();
    });

    it('toggles to table view by click', async () => {
        render(
            <MockApp>
                <ProductsViewWrapper>
                    <ProductsViewToggle />
                </ProductsViewWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Table' }));

        expect(screen.getByRole('radio', { name: 'Table' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Tiles' })).not.toBeChecked();
    });

    it('toggles back to tiles view by click', async () => {
        render(
            <MockApp>
                <ProductsViewWrapper>
                    <ProductsViewToggle />
                </ProductsViewWrapper>
            </MockApp>
        );
        await user.click(screen.getByRole('radio', { name: 'Table' }));
        await user.click(screen.getByRole('radio', { name: 'Tiles' }));

        expect(screen.getByRole('radio', { name: 'Tiles' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Table' })).not.toBeChecked();
    });
});
