import { Center, Stack, Table, Text } from '@mantine/core';
import { IconHome, IconTilde } from '@tabler/icons-react';
import React, { useCallback, useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountSuffix } from '~/client/common/AmountSuffix';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { ProductAmounts as ProductAmountsData, VariantAmount } from '~/types/data';

interface HomeAmountsProps {
    group: string;
    homeBalance: readonly VariantAmount[];
}

function HomeAmounts({ group, homeBalance }: HomeAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    const sorted = [...homeBalance].sort((a, b) => compareVariants(a.variant, b.variant));
    return (
        <span data-type="consumed">
            {sorted.map(({ variant, amount }) => (
                <Text key={variant} c="blue">
                    <IconTilde size={12} />
                    {amount}
                    <AmountSuffix group={group} variant={variant} />
                    <sub>
                        <IconHome size={10} style={{ selfAlign: 'end' }} />
                    </sub>
                </Text>
            ))}
        </span>
    );
}

interface SummaryCellProps {
    group: string;
    name: string;
    year: number;
    amounts?: readonly VariantAmount[];
}

export type SummaryHistoryData = ProductAmountsData;

export function SummaryCell({ group, name, year, amounts }: SummaryCellProps) {
    const [, setActive] = useActiveContent<SummaryHistoryData>();

    const consumed = useMemo(() => amounts?.filter((a) => a.recycled === false) ?? [], [amounts]);
    const recycled = useMemo(() => amounts?.filter((a) => a.recycled === true) ?? [], [amounts]);
    const homeBalance = useMemo(() => amounts?.filter((a) => a.recycled == null && a.home) ?? [], [amounts]);

    const handleClick = useCallback(() => {
        setActive({ action: 'history', data: { group, name, year, amounts: amounts ?? [] } });
    }, [setActive, group, name, year, amounts]);

    const showHome = homeBalance.length > 0;
    const isEmpty = !consumed.length && !recycled.length && !showHome;

    return (
        <Table.Td data-cell data-empty={isEmpty} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <Center>
                {isEmpty ? (
                    '.'
                ) : (
                    <Stack gap={2} align="center">
                        {consumed.length ? <ProductAmounts group={group} amounts={consumed} type="consumed" /> : null}
                        {recycled.length ? <ProductAmounts group={group} amounts={recycled} type="recycled" /> : null}
                        {showHome && <HomeAmounts group={group} homeBalance={homeBalance} />}
                    </Stack>
                )}
            </Center>
        </Table.Td>
    );
}
