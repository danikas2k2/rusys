import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { GridTile } from '~/client/common/GridTile';

describe('<GridTile>', () => {
    const baseProps = { tileKind: 'product' as const, name: 'Avietės' };
    const renderTile = (tile: React.ReactElement) => render(<MockTheme>{tile}</MockTheme>);

    it('renders the shared card structure and forwards its click handler', () => {
        const onClick = vi.fn();
        renderTile(<GridTile {...baseProps} onClick={onClick} amounts={<span>3 vnt.</span>} />);

        const tile = screen.getByText('Avietės').closest('[data-tile]');

        expect(tile).toHaveAttribute('data-tile', 'product');
        expect(tile).toHaveAttribute('data-hidden', 'false');
        expect(tile).toHaveAttribute('data-empty', 'false');
        expect(tile?.querySelector('[data-tile-icon]')).toBeInTheDocument();
        expect(screen.getByText('3 vnt.')).toBeInTheDocument();

        fireEvent.click(tile!);

        expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.any(Object));
    });

    it('renders the photo layer in preference to an icon and applies shared state', () => {
        const { container } = renderTile(
            <GridTile
                {...baseProps}
                tileKind="summary"
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
        expect(container.querySelector('[data-photo-bg]')).toHaveStyle({ backgroundImage: 'url(/photo.jpg)' });
        expect(container.querySelector('[data-scrim]')).toBeInTheDocument();
        expect(container.querySelector('[data-icon-bg]')).not.toBeInTheDocument();
        expect(screen.getByText('Avietės')).toHaveAttribute('data-text-shaddow', 'true');
    });

    it('renders caller-provided slots and permits overriding the text shadow', () => {
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
        expect(container.querySelector('[data-icon-bg]')).toHaveStyle({ backgroundImage: 'url(/icon.png)' });
        expect(screen.getByText('Avietės')).toHaveAttribute('data-text-shaddow', 'false');
        expect(container.querySelector('[data-overlay]')).toHaveTextContent('Recycled');
    });
});
