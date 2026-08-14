import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveAmountBox } from '~/client/pages/products/ActiveAmountBox';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';
import { useProducts } from '~/client/state/products/useProducts';

vi.mock(import('~/client/pages/products/AmountBox'), (): any => ({
    AmountBox: ({ opened, photo, title, onClose, onAfterClose, onEdit, onDelete }: any) =>
        opened ? (
            <div role="dialog" aria-label="Value box" data-photo={photo}>
                {title}
                <button type="button" onClick={() => onClose()}>
                    Close
                </button>
                <button type="button" onClick={onAfterClose}>
                    After close
                </button>
                <button type="button" onClick={onEdit}>
                    Edit
                </button>
                <button type="button" onClick={onDelete}>
                    Delete
                </button>
            </div>
        ) : null,
}));
vi.mock(import('~/client/pages/products/ProductBox'), (): any => ({
    ProductBox: ({ opened, group, name, parent, image, onClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Product box" data-group={group} data-name={name} data-parent={parent}>
                {image}
                <button type="button" onClick={() => onClose()}>
                    Cancel edit
                </button>
                <button type="button" onClick={() => onClose('Uogienės', 'Serbentai')}>
                    Save renamed
                </button>
                <button type="button" onClick={() => onClose(group, name)}>
                    Save unchanged
                </button>
            </div>
        ) : null,
}));
vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn().mockReturnValue([]),
}));
vi.mock(import('~/client/state/products/useDeleteProduct'), () => ({
    useDeleteProduct: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

describe('<ActiveAmountBox>', () => {
    const mockSetActive = vi.fn();
    const data = { group: 'Test', name: 'Item', year: 2024 };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useProducts).mockReturnValue([]);
    });

    it('renders closed when no active content', () => {
        render(
            <MockThemeActive>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Value box' })).not.toBeInTheDocument();
    });

    it('renders closed when action is not values', () => {
        render(
            <MockThemeActive active={{ action: 'update', data }}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Value box' })).not.toBeInTheDocument();
    });

    it('renders opened when action is values and data exists', () => {
        render(
            <MockThemeActive active={{ action: 'values', data }}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
    });

    it('passes the active data photo through to AmountBox', () => {
        render(
            <MockThemeActive active={{ action: 'values', data: { ...data, photo: '/images/ab/cd/photo.png' } }}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Value box' })).toHaveAttribute(
            'data-photo',
            '/images/ab/cd/photo.png'
        );
    });

    it('calls setActive with data on close', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(mockSetActive).toHaveBeenCalledWith({ data });
    });

    it('calls setActive without data on after close', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'After close' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });

    describe('edit', () => {
        it('opens ProductBox with group, name and image, without closing the amounts card', async () => {
            render(
                <MockThemeActive
                    active={{ action: 'values', data: { ...data, image: '/images/ab/cd/product.png' } }}
                    setActive={mockSetActive}
                >
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));

            const productDialog = screen.getByRole('dialog', { name: 'Product box' });

            expect(productDialog).toHaveAttribute('data-group', data.group);
            expect(productDialog).toHaveAttribute('data-name', data.name);
            expect(productDialog).toHaveTextContent('/images/ab/cd/product.png');
            // The amounts card itself never closed - both dialogs are open at once.
            expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
            expect(mockSetActive).not.toHaveBeenCalled();
        });

        it('includes the product parent looked up from the products list', async () => {
            vi.mocked(useProducts).mockReturnValue([{ group: data.group, name: data.name, parent: 'Parent product' }]);

            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));

            expect(screen.getByRole('dialog', { name: 'Product box' })).toHaveAttribute(
                'data-parent',
                'Parent product'
            );
        });

        it('closes ProductBox without touching the shared active store when cancelled', async () => {
            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));
            await user.click(screen.getByRole('button', { name: 'Cancel edit' }));

            expect(screen.queryByRole('dialog', { name: 'Product box' })).not.toBeInTheDocument();
            expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
            expect(mockSetActive).not.toHaveBeenCalled();
        });

        it('does not touch the shared active store when saved with the same group/name', async () => {
            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));
            await user.click(screen.getByRole('button', { name: 'Save unchanged' }));

            expect(mockSetActive).toHaveBeenCalledWith({ action: 'values', data });
        });

        it('points the amounts card at the new group/name after a rename', async () => {
            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));
            await user.click(screen.getByRole('button', { name: 'Save renamed' }));

            expect(mockSetActive).toHaveBeenCalledWith({
                action: 'values',
                data: { ...data, group: 'Uogienės', name: 'Serbentai' },
            });
        });

        it('renders refreshed product name and images from the products list', async () => {
            vi.mocked(useProducts).mockReturnValue([
                {
                    group: data.group,
                    name: data.name,
                    image: '/images/new-icon.png',
                    photo: '/images/new-photo.png',
                },
            ]);

            render(
                <MockThemeActive
                    active={{
                        action: 'values',
                        data: { ...data, image: '/images/old-icon.png', photo: '/images/old-photo.png' },
                    }}
                    setActive={mockSetActive}
                >
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            const amountsDialog = screen.getByRole('dialog', { name: 'Value box' });

            expect(amountsDialog).toHaveAttribute('data-photo', '/images/new-photo.png');
            expect(screen.queryByRole('img', { name: data.name })).not.toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: 'Edit' }));

            expect(screen.getByRole('dialog', { name: 'Product box' })).toHaveTextContent('/images/new-icon.png');
        });
    });

    describe('delete', () => {
        it('opens the remove confirmation without closing the amounts card', async () => {
            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Delete' }));

            expect(screen.getByRole('alertdialog')).toBeInTheDocument();
            expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
            expect(mockSetActive).not.toHaveBeenCalled();
        });

        it('closes the confirmation without deleting or touching active state when cancelled', async () => {
            const deleteProduct = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useDeleteProduct).mockReturnValue(deleteProduct);

            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Delete' }));
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
            expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
            expect(deleteProduct).not.toHaveBeenCalled();
            expect(mockSetActive).not.toHaveBeenCalled();
        });

        it('deletes the product and closes the amounts card when confirmed', async () => {
            const deleteProduct = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useDeleteProduct).mockReturnValue(deleteProduct);

            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Delete' }));
            await user.click(screen.getByRole('button', { name: 'Remove' }));

            expect(deleteProduct).toHaveBeenCalledWith(data.group, data.name);
            expect(mockSetActive).toHaveBeenCalledWith({ data });
        });
    });
});
