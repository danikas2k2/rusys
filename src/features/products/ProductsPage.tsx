import React from 'react';

import type { Product } from '~/common/data';
import { SwipeControls } from '~/components/runtime/SwipeControls';
import { SwipeControlsWrapper } from '~/components/runtime/SwipeControlsContext';
import { Page } from '~/features/common/Page';
import { CategoryRailLayout } from '~/features/filters/CategoryRailLayout';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useSortedGroups } from '~/features/groups/hooks/useSortedGroups';
import { ActiveAmountBox } from '~/features/products/ActiveAmountBox';
import { ActiveProductBox } from '~/features/products/ActiveProductBox';
import { useGroupsWithProducts } from '~/features/products/hooks/useGroupsWithProducts';
import { MissingOnlyCheckbox } from '~/features/products/MissingOnlyCheckbox';
import { MissingOnlyWrapper, useMissingOnly } from '~/features/products/MissingOnlyContext';
import { MissingOnlyEffects } from '~/features/products/MissingOnlyEffects';
import { ProductsGrid } from '~/features/products/ProductsGrid';
import { UpdatingProductsWrapper } from '~/features/products/UpdatingProductsContext';
import { useDeleteProduct } from '~/store/products/useDeleteProduct';

export function ProductsPage() {
    const deleteProduct = useDeleteProduct();
    const handleDelete = ({ group, name }: Product) => deleteProduct(group, name);

    return (
        <UpdatingProductsWrapper>
            <MissingOnlyWrapper>
                <ProductsPageContent onDelete={handleDelete} />
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
    const [missingOnly] = useMissingOnly();

    return (
        <Page withAdd onDelete={onDelete} alignToolbarWithCategoryRail>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithProducts}
                filterActive={missingOnly}
            >
                <div data-products-header>
                    <MissingOnlyCheckbox />
                </div>
                <SwipeControlsWrapper>
                    <MissingOnlyEffects />
                    <ProductsGrid />
                    <SwipeControls />
                </SwipeControlsWrapper>
            </CategoryRailLayout>
            <ActiveProductBox />
            <ActiveAmountBox />
        </Page>
    );
}
