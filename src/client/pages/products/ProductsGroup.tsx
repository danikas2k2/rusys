import { Table } from '@mantine/core';
import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ProductRow } from '~/client/pages/products/ProductRow';
import { useYears } from '~/client/state/years/useYears';
import { GroupTitle } from '~/client/table/GroupTitle';
import { getId } from '~/client/utils/id';
import type { Group, Product } from '~/types/data';

interface ProductsGroupProps {
    group: Group;
    products: readonly Product[];
}

export function ProductsGroup({ group, products }: ProductsGroupProps) {
    const years = useYears();
    const groupFilter = useGroupFilterPredicate();
    const quickFilter = useQuickFilterPredicate();
    const [missingOnly] = useMissingOnly();

    const groupProducts = products.filter((p) => p.group === group.group);
    const hidden =
        !groupFilter(group.group) || !groupProducts.some((p) => (!missingOnly || p.missing) && quickFilter(p.name));

    return (
        <>
            <GroupTitle colSpan={years.length + 1} hidden={hidden}>
                {group.group}
            </GroupTitle>
            <Table.Tbody data-hidden={hidden}>
                {groupProducts.map((p) => (
                    <ProductRow
                        key={getId(p.group, p.name)}
                        product={p}
                        annual={group.annual}
                        hidden={hidden || (missingOnly && !p.missing) || !quickFilter(p.name)}
                    />
                ))}
            </Table.Tbody>
        </>
    );
}
