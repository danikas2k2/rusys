import { Table } from '@mantine/core';
import { isEmpty } from 'lodash';
import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { ReviewProductRow } from '~/client/pages/review/ReviewProductRow';
import { GroupTitle } from '~/client/table/GroupTitle';
import { getId } from '~/client/utils/id';
import type { Group, Product } from '~/types/data';

interface ReviewGroupProps {
    group: Group;
    products: readonly Product[];
    checkedKeys: ReadonlySet<string>;
    onToggle: (key: string, checked: boolean) => void;
}

export function ReviewGroup({ group, products, checkedKeys, onToggle }: ReviewGroupProps) {
    const groupFilter = useGroupFilterPredicate();
    const quickFilter = useQuickFilterPredicate();

    // Nothing to physically confirm for a product with no recorded stock at all.
    const groupProducts = products.filter((p) => p.group === group.group && !isEmpty(p.years));
    const hidden = !groupFilter(group.group) || !groupProducts.some((p) => quickFilter(p.name));

    return (
        <>
            <GroupTitle hidden={hidden}>{group.group}</GroupTitle>
            <Table.Tbody data-hidden={hidden}>
                {groupProducts.map((p) => (
                    <ReviewProductRow
                        key={getId(p.group, p.name)}
                        product={p}
                        checked={checkedKeys.has(getId(p.group, p.name))}
                        onToggle={onToggle}
                        hidden={hidden || !quickFilter(p.name)}
                    />
                ))}
            </Table.Tbody>
        </>
    );
}
