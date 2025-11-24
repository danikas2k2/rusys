import React from 'react';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { GroupProducts } from '~/client/pages/products/GroupProducts';
import type { Product } from '~/types/data';

interface ProductsGroupsProps {
    groups: readonly string[];
    products: readonly Product[];
}

export function ProductsGroups({ groups, products }: ProductsGroupsProps) {
    const group = useGroupFilter();

    return (
        <>
            {groups.map((g) => {
                const groupProducts = products.filter((v) => v.group === g);
                return groupProducts.length || (group && g === group) ? (
                    <GroupProducts key={g} group={g} products={groupProducts} />
                ) : null;
            })}
        </>
    );
}
