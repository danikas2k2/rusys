import { Table } from '@mantine/core';
import { isEmpty } from 'lodash';
import React from 'react';

import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { ReviewProductRow } from '~/client/pages/review/ReviewProductRow';
import { useProducts } from '~/client/state/products/useProducts';
import { getId } from '~/client/utils/id';

interface ReviewTableProps {
    group: string;
    checkedKeys: ReadonlySet<string>;
    onToggle: (key: string, checked: boolean) => void;
}

export function ReviewTable({ group, checkedKeys, onToggle }: ReviewTableProps) {
    const quickFilter = useQuickFilterPredicate();

    // Nothing to physically confirm for a product with no recorded stock at all.
    const products = useProducts().filter((p) => p.group === group && !isEmpty(p.years));

    return (
        <Table layout="fixed" data-table="review">
            <Table.Tbody>
                {products.map((p) => (
                    <ReviewProductRow
                        key={getId(p.group, p.name)}
                        product={p}
                        checked={checkedKeys.has(getId(p.group, p.name))}
                        onToggle={onToggle}
                        hidden={!quickFilter(p.name)}
                    />
                ))}
            </Table.Tbody>
        </Table>
    );
}
