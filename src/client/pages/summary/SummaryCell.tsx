import { Center, Table } from '@mantine/core';
import React from 'react';

import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import type { VariantAmount } from '~/types/data';

export function SummaryCell({ group, amounts }: { group: string; amounts?: readonly VariantAmount[] }) {
    const empty = !amounts?.length;
    return (
        <Table.Td data-cell data-empty={empty}>
            <Center>{empty ? '.' : <ProductAmounts group={group} amounts={amounts} />}</Center>
        </Table.Td>
    );
}
