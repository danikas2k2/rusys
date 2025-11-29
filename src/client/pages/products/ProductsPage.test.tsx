import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { ProductsPage } from '~/client/pages/products/ProductsPage';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';

vi.mock('~/client/pages/products/ProductsTable', async () => ({
    ProductsTable: vi.fn(() => <div>ProductsTable</div>),
}));
vi.mock('~/client/pages/products/MissingOnlyEffects', async () => ({
    MissingOnlyEffects: vi.fn(() => null),
}));
vi.mock('~/client/pages/common/Page');
vi.mock('~/client/common/SwipeControls', async () => ({
    SwipeControls: () => null,
}));
vi.mock('~/client/common/SwipeControlsContext', async () => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/pages/products/ActiveProductBox', async () => ({
    ActiveProductBox: () => null,
}));
vi.mock('~/client/pages/products/ActiveValueBox', async () => ({
    ActiveValueBox: () => null,
}));
vi.mock('~/client/filters/GroupFilterContext', async () => ({
    GroupFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/filters/QuickFilterContext', async () => ({
    QuickFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/toolbar/ToolbarGroupFilter', async () => ({
    ToolbarGroupFilter: () => null,
}));
vi.mock('~/client/pages/products/MissingOnlyContext', async () => ({
    MissingOnlyWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/pages/products/UpdatingProductsContext', async () => ({
    UpdatingProductsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('~/client/state/products/useDeleteProduct');

describe('<ProductsPage>', () => {
    const mockDeleteProduct = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => vi.mocked(useDeleteProduct).mockReturnValue(mockDeleteProduct));

    afterEach(() => vi.clearAllMocks());

    it('renders into the document', () => {
        render(
            <MockApp>
                <ProductsPage />
            </MockApp>
        );

        expect(screen.getByText('ProductsTable')).toBeInTheDocument();
        expect(ProductsTable).toHaveBeenCalledWith({}, undefined);
        expect(MissingOnlyEffects).toHaveBeenCalledWith({}, undefined);
    });

    it('calls deleteProduct when handleDelete is called', async () => {
        let mockDelete: React.ComponentProps<typeof Page>['onDelete'];
        vi.mocked(Page).mockImplementation(({ onDelete }: { onDelete?: (data: unknown) => void }) => {
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
