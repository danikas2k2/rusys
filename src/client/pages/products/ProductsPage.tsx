import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { Page } from '~/client/pages/common/Page';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ActiveAmountBox } from '~/client/pages/products/ActiveAmountBox';
import { ActiveProductBox } from '~/client/pages/products/ActiveProductBox';
import { useGroupsWithProducts } from '~/client/pages/products/hooks/useGroupsWithProducts';
import { MissingOnlyWrapper } from '~/client/pages/products/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { UpdatingProductsWrapper } from '~/client/pages/products/UpdatingProductsContext';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';
import type { Product } from '~/types/data';

export function ProductsPage() {
    const deleteProduct = useDeleteProduct();
    const handleDelete = ({ group, name }: Product) => deleteProduct(group, name);
    const groups = useSortedGroups();
    const [selectedGroup, setSelectedGroup] = useGroupFilter();
    const groupsWithProducts = useGroupsWithProducts();

    return (
        <UpdatingProductsWrapper>
            <Page withAdd onDelete={handleDelete}>
                <CategoryRailLayout
                    groups={groups}
                    selected={selectedGroup}
                    onSelect={setSelectedGroup}
                    groupsWithContent={groupsWithProducts}
                >
                    <SwipeControlsWrapper>
                        <MissingOnlyWrapper>
                            <MissingOnlyEffects />
                            <ProductsTable />
                        </MissingOnlyWrapper>
                        <SwipeControls />
                    </SwipeControlsWrapper>
                </CategoryRailLayout>
                <ActiveProductBox />
                <ActiveAmountBox />
            </Page>
        </UpdatingProductsWrapper>
    );
}
