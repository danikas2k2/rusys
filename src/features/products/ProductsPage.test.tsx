import { render, screen, within } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';
import type { Mocked } from 'vitest';

import React from 'react';

import { Page } from '~/features/common/Page';
import { useDeleteProduct } from '~/features/products/hooks/useDeleteProduct';
import { MissingOnlyEffects } from '~/features/products/MissingOnlyEffects';
import { ProductsGrid } from '~/features/products/ProductsGrid';
import { ProductsPage } from '~/features/products/ProductsPage';

vi.mock(import('~/features/products/ProductsGrid'), (): any => ({
    ProductsGrid: vi.fn(() => <div>ProductsGrid</div>),
}));
vi.mock(import('~/features/products/MissingOnlyEffects'), (): any => ({
    MissingOnlyEffects: vi.fn(() => null),
}));
vi.mock(import('~/features/common/Page'));
vi.mock(import('~/components/runtime/SwipeControls'), (): any => ({
    SwipeControls: () => null,
}));
vi.mock(import('~/components/runtime/SwipeControlsContext'), (): any => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/features/products/ActiveProductBox'), (): any => ({
    ActiveProductBox: () => null,
}));
vi.mock(import('~/features/products/ActiveAmountBox'), (): any => ({
    ActiveAmountBox: () => null,
}));
vi.mock(import('~/features/filters/CategoryRailLayout'), (): any => ({
    CategoryRailLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/features/products/MissingOnlyContext'), (): any => ({
    MissingOnlyWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useMissingOnly: vi.fn(() => [false, vi.fn()]),
}));
vi.mock(import('~/features/products/UpdatingProductsContext'), (): any => ({
    UpdatingProductsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/features/products/hooks/useDeleteProduct'));

describe('<ProductsPage>', () => {
    const mockDeleteProduct = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useDeleteProduct).mockReturnValue(mockDeleteProduct);
    });

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders the grid view by default', () => {
        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        expect(screen.getByText('ProductsGrid')).toBeInTheDocument();
        expect(ProductsGrid).toHaveBeenCalledWith({}, undefined);
        expect(MissingOnlyEffects).toHaveBeenCalledWith({}, undefined);
    });

    it('keeps rendering the grid when the removed table preference is stored', () => {
        localStorage.setItem('productsView', 'table');

        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        expect(screen.getByText('ProductsGrid')).toBeInTheDocument();
    });

    it('shows the missing-only checkbox in the sticky header for grid view', () => {
        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        const header = document.querySelector('[data-products-header]');

        expect(within(header as HTMLElement).getByRole('checkbox')).toBeInTheDocument();
    });

    it('calls deleteProduct when handleDelete is called', async () => {
        let mockDelete: Mocked<React.ComponentProps<typeof Page>['onDelete']>;
        vi.mocked(Page).mockImplementation(({ onDelete }: React.ComponentProps<typeof Page>) => {
            mockDelete = onDelete;
            return <div>Page</div>;
        });

        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        expect(Page).toHaveBeenCalledWith(
            expect.objectContaining({
                onDelete: expect.any(Function),
            }),
            undefined
        );

        await mockDelete!({ group: 'Uogienės', name: 'Avietės', years: [] });

        expect(mockDeleteProduct).toHaveBeenCalledWith('Uogienės', 'Avietės');
    });
});
