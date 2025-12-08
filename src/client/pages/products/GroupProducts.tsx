import React, { useMemo } from 'react';

import { Table } from '@mantine/core';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { ValueRow } from '~/client/pages/products/ValueRow';
import { useYears } from '~/client/state/years/useYears';
import { GroupTitle } from '~/client/table/GroupTitle';
import type { Group, Product } from '~/types/data';

interface GroupProductsProps {
    group: Group;
    products: readonly Product[];
}

export function GroupProducts({ group, products }: GroupProductsProps) {
    const years = useYears();
    const groupProducts = useMemo(() => products.filter((p) => p.group === group.group), [group.group, products]);

    const namePredicate = useQuickFilterPredicate();
    const groupPredicate = useGroupFilterPredicate();
    const [missingOnly] = useMissingOnly();

    const hidden = useMemo(
        () =>
            !groupPredicate(group.group) ||
            groupProducts.every((p) => !namePredicate(p.name) || (missingOnly && !p.missing)),
        [group.group, groupPredicate, groupProducts, missingOnly, namePredicate]
    );

    return (
        <>
            <GroupTitle colSpan={years.length + 1} hidden={hidden}>
                {group.group}
            </GroupTitle>
            <Table.Tbody data-hidden={hidden}>
                {groupProducts.map((p) => (
                    <ValueRow
                        key={`${p.group}:${p.name}`}
                        product={p}
                        annual={group.annual}
                        hidden={hidden || (missingOnly && !p.missing)}
                    />
                ))}
            </Table.Tbody>
        </>
    );
}
