import { render, screen, within } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';
import type { Mocked } from 'vitest';

import { Page } from '~/client/pages/common/Page';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { ProductsGrid } from '~/client/pages/products/ProductsGrid';
import { ProductsPage } from '~/client/pages/products/ProductsPage';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';

vi.mock(import('~/client/pages/products/ProductsGrid'), (): any => ({
    ProductsGrid: vi.fn(() => <div>ProductsGrid</div>),
}));
vi.mock(import('~/client/pages/products/ProductsTable'), (): any => ({
    ProductsTable: vi.fn(() => <div>ProductsTable</div>),
}));
vi.mock(import('~/client/pages/products/MissingOnlyEffects'), (): any => ({
    MissingOnlyEffects: vi.fn(() => null),
}));
vi.mock(import('~/client/pages/common/Page'));
vi.mock(import('~/client/common/SwipeControls'), (): any => ({
    SwipeControls: () => null,
}));
vi.mock(import('~/client/common/SwipeControlsContext'), (): any => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/client/pages/products/ActiveProductBox'), (): any => ({
    ActiveProductBox: () => null,
}));
vi.mock(import('~/client/pages/products/ActiveAmountBox'), (): any => ({
    ActiveAmountBox: () => null,
}));
vi.mock(import('~/client/filters/CategoryRailLayout'), (): any => ({
    CategoryRailLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/client/pages/products/MissingOnlyContext'), (): any => ({
    MissingOnlyWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useMissingOnly: vi.fn(() => [false, vi.fn()]),
}));
vi.mock(import('~/client/pages/products/UpdatingProductsContext'), (): any => ({
    UpdatingProductsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock(import('~/client/state/products/useDeleteProduct'));

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
        expect(ProductsTable).not.toHaveBeenCalled();
        expect(MissingOnlyEffects).toHaveBeenCalledWith({}, undefined);
    });

    it('renders the table view when previously selected', () => {
        localStorage.setItem('productsView', 'table');

        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        expect(screen.getByText('ProductsTable')).toBeInTheDocument();
        expect(ProductsTable).toHaveBeenCalledWith({}, undefined);
        expect(ProductsGrid).not.toHaveBeenCalled();
    });

    it('shows the missing-only checkbox in the sticky header for grid view', () => {
        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        const header = document.querySelector('[data-products-header]');

        expect(header).toHaveAttribute('data-view', 'grid');
        expect(within(header as HTMLElement).getByRole('checkbox')).toBeInTheDocument();
    });

    it('does not show the missing-only checkbox in the header for table view', () => {
        localStorage.setItem('productsView', 'table');

        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        const header = document.querySelector('[data-products-header]');

        expect(header).toHaveAttribute('data-view', 'table');
        expect(within(header as HTMLElement).queryByRole('checkbox')).not.toBeInTheDocument();
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
