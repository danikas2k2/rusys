import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ProductPhotoPreview } from '~/components/products/ProductPhotoPreview';

describe('<ProductPhotoPreview>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it('opens, zooms, and closes the full-screen preview', async () => {
        const onOpenChange = vi.fn();
        render(
            <MockTheme>
                <ProductPhotoPreview photo="/photo.jpg" onOpenChange={onOpenChange} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'View image' }));
        const viewport = document.querySelector('[data-photo-preview-viewport]');

        expect(viewport).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(true);

        await user.click(viewport!);

        expect(viewport).toHaveAttribute('data-zoomed', 'true');

        await user.keyboard('{Escape}');

        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('reports image loading errors from both thumbnail and preview', async () => {
        const onError = vi.fn();
        render(
            <MockTheme>
                <ProductPhotoPreview photo="/photo.jpg" onError={onError} />
            </MockTheme>
        );

        fireEvent.error(document.querySelector('.product-photo-thumbnail img')!);
        await user.click(screen.getByRole('button', { name: 'View image' }));
        fireEvent.error(document.querySelector('[data-photo-preview-viewport] img')!);

        expect(onError).toHaveBeenCalledTimes(2);
    });

    it('uses resized local images for the small preview', () => {
        render(
            <MockTheme>
                <ProductPhotoPreview photo="/images/ab/cd/photo.jpg" />
            </MockTheme>
        );

        const thumbnail = document.querySelector('.product-photo-thumbnail img');

        expect(thumbnail?.getAttribute('srcset')).toContain('/images/ab/cd/photo.jpg?w=48 1x');
        expect(thumbnail?.getAttribute('srcset')).toContain('/images/ab/cd/photo.jpg?w=96 2x');
    });
});
