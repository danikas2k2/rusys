import { Center, Stack, Table, Text } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { ApproxAmountIcon, HomeIcon } from '@icons';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { AmountSuffix } from '~/client/common/AmountSuffix';
import { useAmountView } from '~/client/common/AmountViewContext';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';
import { formatVolume, formatWeight, getAmountTotals } from '~/common/utils/amounts';
import type { ProductAmounts as ProductAmountsData, VariantAmount } from '~/types/data';

interface HomeAmountsProps {
    group: string;
    homeBalance: readonly VariantAmount[];
}

function HomeAmountLine({ children }: React.PropsWithChildren) {
    return (
        <Text c="blue">
            <ApproxAmountIcon size={12} />
            {children}
            <sub>
                <HomeIcon size={10} style={{ selfAlign: 'end' }} />
            </sub>
        </Text>
    );
}

function HomeAmounts({ group, homeBalance }: HomeAmountsProps) {
    const [amountView] = useAmountView();
    const compareVariants = useGroupVariantComparator(group);
    const variants = useVariantsByGroup(group);

    if (amountView === 'total') {
        const { volume, weight, count, unitless } = getAmountTotals(homeBalance, variants);
        const formattedVolume = volume != null ? formatVolume(volume) : undefined;
        const formattedWeight = weight != null ? formatWeight(weight) : undefined;
        const sorted = [...unitless].sort((a, b) => compareVariants(a.variant, b.variant));
        return (
            <span data-type="consumed">
                {formattedVolume && (
                    <HomeAmountLine>
                        {formattedVolume.value}
                        <sub>{formattedVolume.unit}</sub>
                    </HomeAmountLine>
                )}
                {formattedWeight && (
                    <HomeAmountLine>
                        {formattedWeight.value}
                        <sub>{formattedWeight.unit}</sub>
                    </HomeAmountLine>
                )}
                {count != null && <HomeAmountLine>{count}</HomeAmountLine>}
                {sorted.map(({ variant, amount }) => (
                    <HomeAmountLine key={variant}>
                        {amount}
                        <AmountSuffix group={group} variant={variant} />
                    </HomeAmountLine>
                ))}
            </span>
        );
    }

    const sorted = [...homeBalance].sort((a, b) => compareVariants(a.variant, b.variant));
    return (
        <span data-type="consumed">
            {sorted.map(({ variant, amount }) => (
                <HomeAmountLine key={variant}>
                    {amount}
                    <AmountSuffix group={group} variant={variant} />
                </HomeAmountLine>
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
    const setActive = useSetActiveContent<SummaryHistoryData>();

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
