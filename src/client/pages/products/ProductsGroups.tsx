import React from 'react';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { GroupProducts } from '~/client/pages/products/GroupProducts';
import { useVisibleProducts } from '~/client/pages/products/VisibleProductsContext';

interface ProductsGroupsProps {
    groups: readonly string[];
}

export function ProductsGroups({ groups }: ProductsGroupsProps) {
    const group = useGroupFilter();
    const products = useVisibleProducts();

    return (
        <>
            {groups.map((g) => {
                const groupProducts = products.filter((v) => v.group === g);
                return groupProducts.length || (group && g === group) ? (
                    <GroupProducts key={g} group={g} />
                ) : null;
            })}
        </>
    );
}
