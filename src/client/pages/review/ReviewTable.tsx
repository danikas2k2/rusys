import { Table } from '@mantine/core';
import React from 'react';

import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ReviewGroup } from '~/client/pages/review/ReviewGroup';
import { useProducts } from '~/client/state/products/useProducts';

interface ReviewTableProps {
    checkedKeys: ReadonlySet<string>;
    onToggle: (key: string, checked: boolean) => void;
}

export function ReviewTable({ checkedKeys, onToggle }: ReviewTableProps) {
    const groups = useSortedGroups().filter((g) => g.review);
    const products = useProducts();

    return (
        <Table layout="fixed" data-table="review">
            {groups.map((g) => (
                <ReviewGroup
                    key={g.group}
                    group={g}
                    products={products}
                    checkedKeys={checkedKeys}
                    onToggle={onToggle}
                />
            ))}
        </Table>
    );
}
