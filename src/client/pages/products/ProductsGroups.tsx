import React, { memo } from 'react';

import { GroupProducts } from '~/client/pages/products/GroupProducts';
import type { Group, Product } from '~/types/data';

interface ProductsGroupsProps {
    groups: readonly Group[];
    products: readonly Product[];
}

function ProductsGroupsComponent({ groups, products }: ProductsGroupsProps) {
    return (
        <>
            {groups.map((g) => (
                <GroupProducts key={g.group} group={g} products={products} />
            ))}
        </>
    );
}

export const ProductsGroups = memo(ProductsGroupsComponent);
