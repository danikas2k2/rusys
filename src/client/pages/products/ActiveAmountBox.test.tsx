import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveAmountBox } from '~/client/pages/products/ActiveAmountBox';
import { useProducts } from '~/client/state/products/useProducts';

vi.mock(import('~/client/pages/products/AmountBox'), (): any => ({
    AmountBox: ({ opened, image, onClose, onAfterClose, onEdit, onDelete }: any) =>
        opened ? (
            <div role="dialog" aria-label="Value box" data-image={image}>
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
vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn().mockReturnValue([]),
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

    it('passes the active data image through to AmountBox', () => {
        render(
            <MockThemeActive active={{ action: 'values', data: { ...data, image: '/images/ab/cd/product.png' } }}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Value box' })).toHaveAttribute(
            'data-image',
            '/images/ab/cd/product.png'
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
        it('switches to the update action with group, name and image', async () => {
            render(
                <MockThemeActive
                    active={{ action: 'values', data: { ...data, image: '/images/ab/cd/product.png' } }}
                    setActive={mockSetActive}
                >
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));

            expect(mockSetActive).toHaveBeenCalledWith({
                action: 'update',
                data: {
                    group: data.group,
                    name: data.name,
                    parent: undefined,
                    image: '/images/ab/cd/product.png',
                },
            });
        });

        it('includes the product parent looked up from the products list', async () => {
            vi.mocked(useProducts).mockReturnValue([{ group: data.group, name: data.name, parent: 'Parent product' }]);

            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Edit' }));

            expect(mockSetActive).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ parent: 'Parent product' }) })
            );
        });
    });

    describe('delete', () => {
        it('switches to the remove action with just group and name', async () => {
            render(
                <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                    <ActiveAmountBox />
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'Delete' }));

            expect(mockSetActive).toHaveBeenCalledWith({
                action: 'remove',
                data: { group: data.group, name: data.name },
            });
        });
    });
});
