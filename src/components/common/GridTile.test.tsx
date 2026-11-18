import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { GridTile } from '~/components/common/GridTile';

describe('<GridTile>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    const baseProps = { tileKind: 'product' as const, name: 'Avietės' };
    const renderTile = (tile: React.ReactElement) => render(<MockTheme>{tile}</MockTheme>);

    it('renders a product card without an image and forwards its click handler', async () => {
        const onClick = vi.fn();
        renderTile(<GridTile {...baseProps} onClick={onClick} amounts={<span>3 vnt.</span>} />);

        const tile = screen.getByText('Avietės').closest('[data-tile]');

        expect(tile).toHaveAttribute('data-tile', 'product');
        expect(tile).toHaveAttribute('data-hidden', 'false');
        expect(tile).toHaveAttribute('data-empty', 'false');
        expect(tile?.querySelector('[data-product-title]')).toHaveTextContent('Avietės');
        expect(tile?.querySelector('img')).not.toBeInTheDocument();
        expect(screen.getByText('3 vnt.')).toBeInTheDocument();

        await user.click(tile!);

        expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.any(Object));
    });

    it.each([true, false])('renders the summary photo layer with textShadow=%s and shared state', (textShadow) => {
        const { container } = renderTile(
            <GridTile
                {...baseProps}
                tileKind="summary"
                textShadow={textShadow}
                image="/icon.png"
                photo="/photo.jpg"
                hidden
                empty
                fullHeading
                tileData={{ 'data-summary-tile': true, 'data-year': 2025 }}
            />
        );

        const tile = container.querySelector('[data-tile]');

        expect(
            Object.fromEntries(
                [
                    'data-tile',
                    'data-photo',
                    'data-hidden',
                    'data-empty',
                    'data-full-heading',
                    'data-summary-tile',
                    'data-year',
                ].map((attribute) => [attribute, tile?.getAttribute(attribute)])
            )
        ).toStrictEqual({
            'data-tile': 'summary',
            'data-photo': 'true',
            'data-hidden': 'true',
            'data-empty': 'true',
            'data-full-heading': 'true',
            'data-summary-tile': 'true',
            'data-year': '2025',
        });

        const photoBackground = container.querySelector<HTMLImageElement>('[data-photo-bg]')!;

        expect(photoBackground.getAttribute('src')).toContain('%2Fphoto.jpg');
        expect(photoBackground).toHaveAttribute('loading', 'lazy');
        expect(photoBackground).toHaveAttribute('width', '320');
        expect(photoBackground).toHaveAttribute('height', '240');
        expect(container.querySelector('[data-scrim]')).toBeInTheDocument();
        expect(container.querySelector('[data-icon-bg]')).not.toBeInTheDocument();
        expect(screen.getByText('Avietės')).toHaveAttribute('data-text-shadow', String(textShadow));
    });

    it('renders the summary icon and quantities without a photo or scrim', () => {
        const { container } = renderTile(
            <GridTile {...baseProps} tileKind="summary" image="/images/icon.png" amounts={<span>2 vnt.</span>} />
        );
        const icon = container.querySelector('[data-icon-bg]');

        expect(icon?.getAttribute('src')).toContain('/images/icon.png?w=');
        expect(icon).toHaveAttribute('width', '80');
        expect(icon).toHaveAttribute('height', '80');
        expect(icon).toHaveAttribute('loading', 'lazy');
        expect(container.querySelector('[data-photo-bg], [data-scrim]')).not.toBeInTheDocument();
        expect(screen.getByText('Avietės')).toHaveAttribute('data-text-shadow', 'true');
        expect(container.querySelector('[data-tile-amounts]')).toHaveTextContent('2 vnt.');
    });

    it('renders caller-provided slots and a small title icon without a background', () => {
        const { container } = renderTile(
            <GridTile
                {...baseProps}
                image="/icon.png"
                textShadow={false}
                leading={<button type="button">Available</button>}
                headingAction={<button type="button">Expand</button>}
                overlay={<span data-overlay>Recycled</span>}
            />
        );

        expect(screen.getByRole('button', { name: 'Available' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument();
        expect(container.querySelector('[data-tile-icon]')).not.toBeInTheDocument();
        expect(container.querySelector('[data-product-title] [data-product-icon]')?.getAttribute('src')).toContain(
            '%2Ficon.png'
        );
        expect(container.querySelector('[data-product-icon]')).toHaveAttribute('loading', 'lazy');
        expect(container.querySelector('[data-product-icon]')).toHaveAttribute('width', '26');
        expect(container.querySelector('[data-icon-bg], [data-photo-bg], [data-scrim]')).not.toBeInTheDocument();
        expect(screen.getByText('Avietės')).not.toHaveAttribute('data-text-shadow');
        expect(container.querySelector('[data-overlay]')).toHaveTextContent('Recycled');
    });

    it('renders a decorative initial when a product has no image or photo', () => {
        const { container } = renderTile(<GridTile {...baseProps} name="  avietės" />);

        expect(container.querySelector('[data-product-avatar]')).toHaveTextContent('A');
        expect(container.querySelector('[data-product-avatar]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('loads a product photo eagerly and prefers it over the title icon', () => {
        const { container } = renderTile(
            <GridTile {...baseProps} image="/icon.png" photo="/photo.jpg" imageLoading="eager" />
        );

        const photo = container.querySelector('[data-product-thumbnail]');

        expect(photo).toHaveAttribute('loading', 'eager');
        expect(photo?.getAttribute('src')).toContain('%2Fphoto.jpg');
        expect(photo).toHaveAttribute('width', '26');
        expect(photo).toHaveAttribute('height', '26');
        expect(container.querySelector('[data-product-icon], [data-photo-bg], [data-scrim]')).not.toBeInTheDocument();
        expect(container.querySelector('[data-product-avatar]')).not.toBeInTheDocument();
    });
});
