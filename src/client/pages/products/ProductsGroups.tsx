import React, { memo } from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { GroupProducts } from '~/client/pages/products/GroupProducts';
import { useVisibleProducts } from '~/client/pages/products/VisibleProductsContext';

interface ProductsGroupsProps {
    groups: readonly string[];
}

function ProductsGroupsComponent({ groups }: ProductsGroupsProps) {
    const [group] = useGroupFilter();
    const products = useVisibleProducts();

    return (
        <>
            {groups.map((g) => {
                const groupProducts = products.filter((v) => v.group === g);
                return groupProducts.length || (group && g === group) ? <GroupProducts key={g} group={g} /> : null;
            })}
        </>
    );
}

export const ProductsGroups = memo(ProductsGroupsComponent);
