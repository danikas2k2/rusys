import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        expect(screen.getByRole('button', { name: 'View image' })).toBeInTheDocument();
    });

    it('opens the photo viewer and toggles between fitting and original-size modes', async () => {
        const user = userEvent.setup();
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

        fireEvent.pointerDown(viewer, { pointerId: 1, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(viewer, { pointerId: 1, clientX: 35, clientY: 50 });
        fireEvent.pointerUp(viewer, { pointerId: 1 });

        expect(viewer.querySelector('img')).toHaveStyle({ transform: 'translate(25px, 30px)' });

        await user.click(viewer);

        // The click that ends a drag must not collapse the image; the next click does.
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
