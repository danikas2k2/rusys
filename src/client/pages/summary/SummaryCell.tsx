import React from 'react';

import { Center, Table } from '@mantine/core';

import { ValueAmounts } from '~/client/pages/products/ValueAmounts';
import type { VariantAmount } from '~/types/data';

export function SummaryCell({ group, amounts }: { group: string; amounts?: readonly VariantAmount[] }) {
    const empty = !amounts?.length;
    return (
        <Table.Td data-cell data-empty={empty}>
            <Center>{empty ? '.' : <ValueAmounts group={group} amounts={amounts} />}</Center>
        </Table.Td>
    );
}
