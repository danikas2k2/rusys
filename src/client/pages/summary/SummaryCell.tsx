import { Center, Stack, Table } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import type { ProductAmounts as ProductAmountsData, VariantAmount } from '~/types/data';

interface SummaryCellProps {
    group: string;
    name: string;
    year: number;
    amounts?: readonly VariantAmount[];
}

export type SummaryHistoryData = ProductAmountsData;

export function SummaryCell({ group, name, year, amounts }: SummaryCellProps) {
    const [, setActive] = useActiveContent<SummaryHistoryData>();
    const empty = !amounts?.length;

    const consumed = useMemo(() => amounts?.filter((a) => !a.recycled), [amounts]);
    const recycled = useMemo(() => amounts?.filter((a) => a.recycled), [amounts]);

    const handleClick = useCallback(() => {
        setActive({ action: 'history', data: { group, name, year, amounts: amounts ?? [] } });
    }, [setActive, group, name, year, amounts]);

    return (
        <Table.Td data-cell data-empty={empty} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <Center>
                {empty ? (
                    '.'
                ) : (
                    <Stack gap={2} align="center">
                        {consumed?.length ? <ProductAmounts group={group} amounts={consumed} type="consumed" /> : null}
                        {recycled?.length ? <ProductAmounts group={group} amounts={recycled} type="recycled" /> : null}
                    </Stack>
                )}
            </Center>
        </Table.Td>
    );
}
