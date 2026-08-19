import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ProductPhotoPreview } from '~/client/common/ProductPhotoPreview';

describe('<ProductPhotoPreview>', () => {
    it('opens, zooms, and closes the full-screen preview', () => {
        const onOpenChange = vi.fn();
        render(
            <MockTheme>
                <ProductPhotoPreview photo="/photo.jpg" onOpenChange={onOpenChange} />
            </MockTheme>
        );

        fireEvent.click(screen.getByRole('button', { name: 'View image' }));
        const viewport = document.querySelector('[data-photo-preview-viewport]');

        expect(viewport).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(true);

        fireEvent.click(viewport!);

        expect(viewport).toHaveAttribute('data-zoomed', 'true');

        fireEvent.keyDown(document.body, { key: 'Escape' });

        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('reports image loading errors from both thumbnail and preview', () => {
        const onError = vi.fn();
        render(
            <MockTheme>
                <ProductPhotoPreview photo="/photo.jpg" onError={onError} />
            </MockTheme>
        );

        fireEvent.error(document.querySelector('.product-photo-thumbnail img')!);
        fireEvent.click(screen.getByRole('button', { name: 'View image' }));
        fireEvent.error(document.querySelector('[data-photo-preview-viewport] img')!);

        expect(onError).toHaveBeenCalledTimes(2);
    });
});
