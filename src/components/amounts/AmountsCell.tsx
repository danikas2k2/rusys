import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import type { VariantAmount } from '@rusys/common/data';
import React from 'react';

import { ConsumedIcon, HomeIcon, RecycledIcon, SuspiciousIcon, UpdatedIcon } from '@icons';

import { VariantTitle } from '~/components/amounts/VariantTitle';
import { useGroupVariantComparator } from '~/store/variants/useGroupVariantComparator';

export function AmountsCell({
    group = '',
    amounts,
}: {
    group?: string;
    amounts: readonly VariantAmount[];
}): React.ReactElement {
    const comparator = useGroupVariantComparator(group);
    if (!amounts.length) {
        return (
            <Text size="sm" c="dimmed">
                —
            </Text>
        );
    }
    const sorted = [...amounts].sort(
        (a, b) =>
            comparator(a.variant, b.variant) ||
            (!!a.suspicious === !!b.suspicious && !!a.home === !!b.home ? 0 : a.suspicious || a.home ? 1 : -1)
    );
    return (
        <Stack gap={4}>
            {sorted.map((a) => {
                const isUpdated = a.recycled == null;
                const typeLabel = isUpdated ? 'Updated' : a.recycled ? 'Recycled' : 'Consumed';
                const color = isUpdated ? 'blue' : a.recycled ? 'negative' : 'positive';
                const Icon = isUpdated ? UpdatedIcon : a.recycled ? RecycledIcon : ConsumedIcon;
                const key = `${a.variant}-${a.amount}-${a.recycled == null ? 'u' : a.recycled ? 'r' : 'c'}${a.suspicious ? '-s' : ''}${a.home ? '-h' : ''}`;
                const labelColor = a.suspicious ? 'moderate' : a.home ? 'blue' : undefined;
                return (
                    <Group key={key} justify="space-between" wrap="nowrap" gap="xs">
                        <Group wrap="nowrap" gap="xs">
                            <ThemeIcon size="sm" variant="light" color={color} title={typeLabel} aria-label={typeLabel}>
                                <Icon size={14} />
                            </ThemeIcon>
                            <Text size="sm" c={labelColor}>
                                <VariantTitle group={group} variant={a.variant} />
                                {a.suspicious && (
                                    <ThemeIcon
                                        size="xs"
                                        variant="transparent"
                                        color="moderate"
                                        display="inline-flex"
                                        ms={4}
                                    >
                                        <SuspiciousIcon size={12} />
                                    </ThemeIcon>
                                )}
                                {a.home && (
                                    <ThemeIcon
                                        size="xs"
                                        variant="transparent"
                                        color="blue"
                                        display="inline-flex"
                                        ms={4}
                                    >
                                        <HomeIcon size={12} />
                                    </ThemeIcon>
                                )}
                            </Text>
                        </Group>
                        <Text size="sm" fw={500} c={a.amount > 0 ? 'positive' : a.amount < 0 ? 'negative' : undefined}>
                            {a.amount > 0 ? `+${a.amount}` : a.amount < 0 ? `−${Math.abs(a.amount)}` : '0'}
                        </Text>
                    </Group>
                );
            })}
        </Stack>
    );
}
