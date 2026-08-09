import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ProductDialogIcon } from '~/client/common/ProductDialogIcon';

describe('<ProductDialogIcon>', () => {
    it('renders the generic icon when there is no photo', () => {
        const { container } = render(
            <MockTheme>
                <ProductDialogIcon />
            </MockTheme>
        );

        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-list')).toBeInTheDocument();
    });

    it('renders the product photo when given', () => {
        const { container } = render(
            <MockTheme>
                <ProductDialogIcon photo="/images/ab/cd/product.png" />
            </MockTheme>
        );

        expect(container.querySelector('img')).toHaveAttribute('src', '/images/ab/cd/product.png');
    });

    it('falls back to the generic icon when the photo fails to load', () => {
        const { container } = render(
            <MockTheme>
                <ProductDialogIcon photo="/images/ab/cd/product.png" />
            </MockTheme>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-list')).toBeInTheDocument();
    });

    it('retries the new photo after a failure once the photo prop changes', () => {
        const { container, rerender } = render(
            <MockTheme>
                <ProductDialogIcon photo="/images/ab/cd/product.png" />
            </MockTheme>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(container.querySelector('img')).not.toBeInTheDocument();

        rerender(
            <MockTheme>
                <ProductDialogIcon photo="/images/ef/gh/other.png" />
            </MockTheme>
        );

        expect(container.querySelector('img')).toHaveAttribute('src', '/images/ef/gh/other.png');
    });

    it('sets the aria-label on the icon container', () => {
        render(
            <MockTheme>
                <ProductDialogIcon aria-label="Edit entry" />
            </MockTheme>
        );

        expect(screen.getByRole('img', { name: 'Edit entry' })).toBeInTheDocument();
    });
});
