import { Center, Table } from '@mantine/core';
import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useUpdateType, type UpdateTypes } from '~/client/common/UpdateTypeContext';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import type { ProductAmounts as ProductAmountsData, VariantAmount } from '~/types/data';

interface SummaryCellProps {
    group: string;
    name: string;
    year: number;
    amounts?: readonly VariantAmount[];
}

export interface SummaryHistoryData extends ProductAmountsData {
    updateType: UpdateTypes;
}

export function SummaryCell({ group, name, year, amounts }: SummaryCellProps) {
    const [, setActive] = useActiveContent<SummaryHistoryData>();
    const [updateType] = useUpdateType();
    const empty = !amounts?.length;

    const handleClick = useCallback(() => {
        setActive({ action: 'history', data: { group, name, year, amounts: amounts ?? [], updateType } });
    }, [setActive, group, name, year, amounts, updateType]);

    return (
        <Table.Td data-cell data-empty={empty} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <Center>{empty ? '.' : <ProductAmounts group={group} amounts={amounts} />}</Center>
        </Table.Td>
    );
}
