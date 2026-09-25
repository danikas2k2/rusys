import { Group, Stack, Text } from '@mantine/core';
import React, { useMemo } from 'react';

import { ApproxAmountIcon, HomeIcon } from '@icons';

import type { ProductAmounts as ProductAmountsData, VariantAmount } from '~/common/data';
import { formatVolume, formatWeight, getAmountTotals } from '~/common/utils/amounts';
import { AmountSuffix } from '~/components/amounts/AmountSuffix';
import { useAmountView } from '~/components/amounts/AmountViewContext';
import { AnnotatedTotalAmounts } from '~/components/amounts/AnnotatedTotalAmounts';
import { useGroupVariantComparator } from '~/store/variants/useGroupVariantComparator';
import { useVariantsByGroup } from '~/store/variants/useVariantsByGroup';

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

export type SummaryHistoryData = ProductAmountsData;

export function SummaryAmounts({
    group,
    amounts,
    inline = false,
}: {
    group: string;
    amounts?: readonly VariantAmount[];
    inline?: boolean;
}) {
    const consumed = useMemo(() => amounts?.filter((a) => a.recycled === false) ?? [], [amounts]);
    const recycled = useMemo(() => amounts?.filter((a) => a.recycled === true) ?? [], [amounts]);
    const homeBalance = useMemo(() => amounts?.filter((a) => a.recycled == null && a.home) ?? [], [amounts]);

    const showHome = homeBalance.length > 0;
    const isEmpty = !consumed.length && !recycled.length && !showHome;

    if (isEmpty) {
        return '.';
    }

    const sections = [
        consumed.length ? (
            <span key="consumed" data-type="consumed">
                <AnnotatedTotalAmounts group={group} amounts={consumed} />
            </span>
        ) : null,
        recycled.length ? (
            <span key="recycled" data-type="recycled">
                <AnnotatedTotalAmounts group={group} amounts={recycled} />
            </span>
        ) : null,
        showHome ? <HomeAmounts key="home" group={group} homeBalance={homeBalance} /> : null,
    ].filter((section) => section != null);

    if (inline) {
        return (
            <Group gap="xs" wrap="nowrap" data-summary-amounts-inline>
                {sections.map((section, index) => (
                    <React.Fragment key={section.key}>
                        {index > 0 && <Text c="dimmed">/</Text>}
                        {section}
                    </React.Fragment>
                ))}
            </Group>
        );
    }

    return (
        <Stack gap={2} align="center">
            {sections}
        </Stack>
    );
}
