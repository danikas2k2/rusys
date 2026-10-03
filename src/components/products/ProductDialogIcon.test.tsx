import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ProductDialogIcon } from '~/components/products/ProductDialogIcon';

describe('<ProductDialogIcon>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

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

        const thumbnail = container.querySelector('.product-photo-thumbnail img');

        expect(thumbnail?.getAttribute('src')).toContain('/images/ab/cd/product.png?w=96');
        expect(thumbnail?.getAttribute('srcset')).toContain('/images/ab/cd/product.png?w=48 1x');
        expect(thumbnail?.getAttribute('srcset')).toContain('/images/ab/cd/product.png?w=96 2x');
        expect(screen.getByRole('button', { name: 'View image' })).toBeInTheDocument();
    });

    it('opens the photo viewer and toggles between fitting and original-size modes', async () => {
        render(
            <MockTheme>
                <ProductDialogIcon photo="/images/ab/cd/product.png" />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'View image' }));
        const viewer = screen.getByRole('button', { name: 'Click to zoom' });

        expect(viewer).not.toHaveAttribute('data-zoomed');

        await user.click(viewer);

        expect(viewer).toHaveAttribute('data-zoomed', 'true');

        await user.pointer([
            { keys: '[MouseLeft>]', target: viewer, coords: { x: 10, y: 20 } },
            { target: viewer, coords: { x: 35, y: 50 } },
            { keys: '[/MouseLeft]', target: viewer },
        ]);

        expect(viewer.querySelector('img')).toHaveStyle({ transform: 'translate(25px, 30px)' });
        // The click emitted at the end of the drag must not collapse the image.
        expect(viewer).toHaveAttribute('data-zoomed', 'true');

        await user.click(viewer);

        expect(viewer).not.toHaveAttribute('data-zoomed');
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

        const thumbnail = container.querySelector('.product-photo-thumbnail img');

        expect(thumbnail?.getAttribute('src')).toContain('/images/ef/gh/other.png?w=96');
        expect(thumbnail?.getAttribute('srcset')).toContain('/images/ef/gh/other.png?w=48 1x');
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
