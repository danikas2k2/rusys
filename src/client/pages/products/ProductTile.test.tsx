import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { ProductTile, type ProductTileProps } from '~/client/pages/products/ProductTile';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import type { Product } from '~/common/data';

vi.mock(import('~/client/common/ActiveContentContext'), async () => ({
    ...(await vi.importActual('~/client/common/ActiveContentContext')),
    useSetActiveContent: vi.fn(),
}));
vi.mock(import('~/client/state/products/useSetProductMissing'), () => ({
    useSetProductMissing: vi.fn(),
}));

describe('<ProductTile>', () => {
    const group = 'Daržovės';
    const name = 'Kopūstai';

    const setActive = vi.fn();
    const setMissing = vi.fn();

    beforeEach(() => {
        vi.mocked(useSetActiveContent).mockReturnValue(setActive);
        vi.mocked(useSetProductMissing).mockReturnValue(setMissing);
    });

    afterEach(() => vi.clearAllMocks());

    const product: Product = {
        group,
        name,
        years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
    };

    const defaultProps: ProductTileProps = { product, totalAmounts: [{ variant: 'p', amount: 2 }] };

    it('renders the product name', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} />
            </MockApp>
        );

        expect(screen.getByText(name)).toBeInTheDocument();
    });

    it('renders no amounts when totalAmounts is empty', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} totalAmounts={[]} />
            </MockApp>
        );

        expect(screen.queryByText('—')).not.toBeInTheDocument();
    });

    it('marks the tile as empty (greyed out) when totalAmounts is empty', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} totalAmounts={[]} />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-empty', 'true');
    });

    it('does not mark the tile as empty when totalAmounts has values', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-empty', 'false');
    });

    it('marks the tile and shows an icon when any product year is marked for removal', () => {
        render(
            <MockApp>
                <ProductTile
                    {...defaultProps}
                    product={{
                        ...product,
                        years: [
                            { year: 22, amounts: [{ variant: 'p', amount: 2 }] },
                            { year: 21, amounts: [], removing: true },
                        ],
                    }}
                />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-removing', 'true');
        expect(screen.getByLabelText('Marked for removal')).toBeInTheDocument();
    });

    it('does not mark the tile when no product year is marked for removal', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-removing', 'false');
        expect(screen.queryByLabelText('Marked for removal')).not.toBeInTheDocument();
    });

    it('does not mark an expanded parent as empty when a child has an amount, even with no own amounts', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} totalAmounts={[]} hasChildren expanded hasNonEmptyDescendant />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-empty', 'false');
    });

    it('marks an expanded parent as empty when it has no own amounts and no child has one either', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} totalAmounts={[]} hasChildren expanded hasNonEmptyDescendant={false} />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-empty', 'true');
    });

    it('opens the amounts dialog with year 0 and the product own combined amounts for a leaf tile', async () => {
        render(
            <MockApp state={{ variants: [{ group, variant: 'p', order: 0 }] }}>
                <ProductTile {...defaultProps} />
            </MockApp>
        );

        await user.click(screen.getByText(name));

        expect(setActive).toHaveBeenCalledWith({
            action: 'values',
            data: { group, name, year: 0, amounts: [{ variant: 'p', amount: 2 }], image: undefined, photo: undefined },
        });
    });

    it('opens the amounts dialog at the preferred year for an annual product', async () => {
        const thisYear = new Date().getFullYear() % 100;
        const annualProduct: Product = {
            group,
            name,
            years: [{ year: thisYear - 1, amounts: [{ variant: 'p', amount: 5 }] }],
        };

        render(
            <MockApp state={{ variants: [{ group, variant: 'p', order: 0 }] }}>
                <ProductTile product={annualProduct} annual totalAmounts={[{ variant: 'p', amount: 5 }]} />
            </MockApp>
        );

        await user.click(screen.getByText(name));

        expect(setActive).toHaveBeenCalledWith({
            action: 'values',
            data: {
                group,
                name,
                year: thisYear - 1,
                amounts: [{ variant: 'p', amount: 5 }],
                image: undefined,
                photo: undefined,
            },
        });
    });

    it('includes the product image when opening the dialog', async () => {
        const productWithImage = { ...product, image: '/images/ab/cd/product.png' };

        render(
            <MockApp state={{ variants: [{ group, variant: 'p', order: 0 }] }}>
                <ProductTile {...defaultProps} product={productWithImage} />
            </MockApp>
        );

        await user.click(screen.getByText(name));

        expect(setActive).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ image: '/images/ab/cd/product.png' }) })
        );
    });

    it('toggles expand instead of opening the dialog when collapsed with children', async () => {
        const onToggleExpand = vi.fn();

        render(
            <MockApp>
                <ProductTile {...defaultProps} hasChildren expanded={false} onToggleExpand={onToggleExpand} />
            </MockApp>
        );

        await user.click(screen.getByText(name));

        expect(onToggleExpand).toHaveBeenCalledWith();
        expect(setActive).not.toHaveBeenCalled();
    });

    it('opens the dialog (does not toggle) once expanded, even with children', async () => {
        const onToggleExpand = vi.fn();

        render(
            <MockApp state={{ variants: [{ group, variant: 'p', order: 0 }] }}>
                <ProductTile {...defaultProps} hasChildren expanded onToggleExpand={onToggleExpand} />
            </MockApp>
        );

        await user.click(screen.getByText(name));

        expect(onToggleExpand).not.toHaveBeenCalled();
        expect(setActive).toHaveBeenCalledWith({
            action: 'values',
            data: { group, name, year: 0, amounts: [{ variant: 'p', amount: 2 }], image: undefined, photo: undefined },
        });
    });

    it('renders an expand chevron when hasChildren is true and toggles on click without opening the dialog', async () => {
        const onToggleExpand = vi.fn();

        render(
            <MockApp>
                <ProductTile {...defaultProps} hasChildren expanded={false} onToggleExpand={onToggleExpand} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(onToggleExpand).toHaveBeenCalledTimes(1);
        expect(setActive).not.toHaveBeenCalled();
    });

    it('does not render an expand chevron when hasChildren is false', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} />
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });

    it('marks the tile as an expanded parent when hasChildren and expanded, to match its children panel', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} hasChildren expanded />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-expanded-parent', 'true');
    });

    it('does not mark the tile as an expanded parent while collapsed', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} hasChildren expanded={false} />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute(
            'data-expanded-parent',
            'false'
        );
    });

    it('hides the tile when hidden is set', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} hidden />
            </MockApp>
        );

        expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-hidden', 'true');
    });

    it('toggles missing on checkbox click without opening the dialog', async () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} product={{ ...product, missing: false }} />
            </MockApp>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissing).toHaveBeenCalledWith(group, name, true);
        expect(setActive).not.toHaveBeenCalled();
    });

    it('disables the missing checkbox when the product has no years at all', () => {
        render(
            <MockApp>
                <ProductTile {...defaultProps} product={{ group, name }} totalAmounts={[]} />
            </MockApp>
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    describe('image mode', () => {
        it('renders no icon watermark and no photo background when the product has no image', () => {
            const { container } = render(
                <MockApp>
                    <ProductTile {...defaultProps} />
                </MockApp>
            );

            expect(container.querySelector('img')).not.toBeInTheDocument();
            expect(container.querySelector('[data-icon-bg]')).not.toBeInTheDocument();
            expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-photo', 'false');
        });

        it('shows the image as an 80x80 corner watermark when icon-sized (no photo)', () => {
            const productWithImage = { ...product, image: '/images/ab/cd/product.png' };

            const { container } = render(
                <MockApp>
                    <ProductTile {...defaultProps} product={productWithImage} />
                </MockApp>
            );

            expect(container.querySelector('[data-icon-bg]')).toHaveStyle({
                backgroundImage: 'url(/images/ab/cd/product.png)',
            });
            expect(container.querySelector('img')).not.toBeInTheDocument();
            expect(screen.getByText(name).closest('[data-tile="product"]')).toHaveAttribute('data-photo', 'false');
        });

        it('shows the photo as a tile background with a scrim when photo-sized (photo present)', () => {
            const productWithImage = {
                ...product,
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/product.png',
            };

            const { container } = render(
                <MockApp>
                    <ProductTile {...defaultProps} product={productWithImage} />
                </MockApp>
            );

            const tile = screen.getByText(name).closest('[data-tile="product"]');

            expect(tile).toHaveAttribute('data-photo', 'true');
            expect(container.querySelector('[data-photo-bg]')).toHaveStyle({
                backgroundImage: 'url(/images/ab/cd/product.png)',
            });
            expect(container.querySelector('img')).not.toBeInTheDocument();
        });
    });
});
