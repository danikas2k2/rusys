import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveProductBox } from '~/client/pages/products/ActiveProductBox';
import { ActiveValueBox } from '~/client/pages/products/ActiveValueBox';
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
        <GroupFilterWrapper>
            <QuickFilterWrapper>
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
                        <ActiveValueBox />
                    </Page>
                </UpdatingProductsWrapper>
            </QuickFilterWrapper>
        </GroupFilterWrapper>
    );
}
