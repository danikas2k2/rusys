import { Group } from '@mantine/core';
import React from 'react';

import { ProductsViewWrapper, useProductsView } from '~/client/common/ProductsViewContext';
import { ProductsViewToggle } from '~/client/common/ProductsViewToggle';
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
import { ProductsGrid } from '~/client/pages/products/ProductsGrid';
import { ProductsTable } from '~/client/pages/products/ProductsTable';
import { UpdatingProductsWrapper } from '~/client/pages/products/UpdatingProductsContext';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';
import type { Product } from '~/types/data';

export function ProductsPage() {
    const deleteProduct = useDeleteProduct();
    const handleDelete = ({ group, name }: Product) => deleteProduct(group, name);

    return (
        <UpdatingProductsWrapper>
            <MissingOnlyWrapper>
                <ProductsViewWrapper>
                    <ProductsPageContent onDelete={handleDelete} />
                </ProductsViewWrapper>
            </MissingOnlyWrapper>
        </UpdatingProductsWrapper>
    );
}

// Split out so useGroupsWithProducts (which reads missingOnly) resolves against a real
// MissingOnlyWrapper - a hook call in ProductsPage itself would run above that provider.
function ProductsPageContent({ onDelete }: { onDelete: (product: Product) => void | Promise<void> }) {
    const groups = useSortedGroups();
    const [selectedGroup, setSelectedGroup] = useGroupFilter();
    const groupsWithProducts = useGroupsWithProducts();
    const [productsView] = useProductsView();

    return (
        <Page withAdd onDelete={onDelete}>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithProducts}
            >
                <Group justify="flex-end" mb="xs">
                    <ProductsViewToggle />
                </Group>
                <SwipeControlsWrapper>
                    <MissingOnlyEffects />
                    {productsView === 'grid' ? <ProductsGrid /> : <ProductsTable />}
                    <SwipeControls />
                </SwipeControlsWrapper>
            </CategoryRailLayout>
            <ActiveProductBox />
            <ActiveAmountBox />
        </Page>
    );
}
