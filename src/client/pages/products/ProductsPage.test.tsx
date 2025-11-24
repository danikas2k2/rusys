import { render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Page } from '~/client/pages/common/Page';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { ProductsPage } from '~/client/pages/products/ProductsPage';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';

jest.mock('~/client/pages/products/ProductsTable', () => ({
    ProductsTable: jest.fn(() => <div>ProductsTable</div>),
}));
jest.mock('~/client/pages/products/MissingOnlyEffects', () => ({
    MissingOnlyEffects: jest.fn(() => null),
}));
jest.mock('~/client/pages/common/Page');
jest.mock('~/client/common/SwipeControls', () => ({
    SwipeControls: () => null,
}));
jest.mock('~/client/common/SwipeControlsContext', () => ({
    SwipeControlsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/pages/products/ActiveProductBox', () => ({
    ActiveProductBox: () => null,
}));
jest.mock('~/client/pages/products/ActiveValueBox', () => ({
    ActiveValueBox: () => null,
}));
jest.mock('~/client/filters/GroupFilterContext', () => ({
    GroupFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/filters/QuickFilterContext', () => ({
    QuickFilterWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/toolbar/ToolbarGroupFilter', () => ({
    ToolbarGroupFilter: () => null,
}));
jest.mock('~/client/pages/products/MissingOnlyContext', () => ({
    MissingOnlyWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/pages/products/UpdatingProductsContext', () => ({
    UpdatingProductsWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('~/client/state/products/useDeleteProduct');

describe('<ProductsPage>', () => {
    const mockDeleteProduct = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => jest.mocked(useDeleteProduct).mockReturnValue(mockDeleteProduct));

    afterEach(() => jest.clearAllMocks());

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
        let mockDelete: jest.Mocked<React.ComponentProps<typeof Page>['onDelete']>;
        jest.mocked(Page).mockImplementation(({ onDelete }) => {
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
