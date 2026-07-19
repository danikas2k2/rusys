import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveAmountBox } from '~/client/pages/products/ActiveAmountBox';
import { ActiveProductBox } from '~/client/pages/products/ActiveProductBox';
import { MissingOnlyWrapper } from '~/client/pages/products/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { UpdatingProductsWrapper } from '~/client/pages/products/UpdatingProductsContext';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import type { Product } from '~/types/data';

export function ProductsPage() {
    const deleteProduct = useDeleteProduct();
    const handleDelete = ({ group, name }: Product) => deleteProduct(group, name);

    return (
        <UpdatingProductsWrapper>
            <Page withAdd toolbar={<ToolbarGroupFilter />} onDelete={handleDelete}>
                <SwipeControlsWrapper>
                    <MissingOnlyWrapper>
                        <MissingOnlyEffects />
                        <ProductsTable />
                    </MissingOnlyWrapper>
                    <SwipeControls />
                </SwipeControlsWrapper>
                <ActiveProductBox />
                <ActiveAmountBox />
            </Page>
        </UpdatingProductsWrapper>
    );
}
