import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconEdit, IconToolsKitchen2, IconTrash } from '@tabler/icons-react';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { VariantTitle } from '~/client/common/VariantTitle';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { ProductAmounts, VariantAmount } from '~/types/data';

export function AmountsCell({ amounts }: { amounts: readonly VariantAmount[] }): React.ReactElement {
    const [active] = useActiveContent<ProductAmounts>();
    const group = active?.data?.group ?? '';

    const comparator = useGroupVariantComparator(group);

    if (!amounts.length) {
        return (
            <Text size="sm" c="dimmed">
                —
            </Text>
        );
    }

    const sorted = [...amounts].sort(
        (a, b) => comparator(a.variant, b.variant) || (!!a.suspicious === !!b.suspicious ? 0 : a.suspicious ? 1 : -1)
    );

    return (
        <Stack gap={4}>
            {sorted.map((a) => {
                const isUpdated = a.recycled == null;
                const typeLabel = isUpdated ? 'Updated' : a.recycled ? 'Recycled' : 'Consumed';
                const color = isUpdated ? 'blue' : a.recycled ? 'negative' : 'positive';
                const Icon = isUpdated ? IconEdit : a.recycled ? IconTrash : IconToolsKitchen2;
                const key = `${a.variant}-${a.amount}-${a.recycled == null ? 'u' : a.recycled ? 'r' : 'c'}${a.suspicious ? '-s' : ''}`;

                return (
                    <Group key={key} justify="space-between" wrap="nowrap" gap="xs">
                        <Group wrap="nowrap" gap="xs">
                            <ThemeIcon size="sm" variant="light" color={color} title={typeLabel} aria-label={typeLabel}>
                                <Icon size={14} />
                            </ThemeIcon>
                            <Text size="sm" c={a.suspicious ? 'moderate' : undefined}>
                                <VariantTitle group={group} variant={a.variant} />
                                {a.suspicious && (
                                    <ThemeIcon
                                        size="xs"
                                        variant="transparent"
                                        color="moderate"
                                        display="inline-flex"
                                        ms={4}
                                    >
                                        <IconAlertTriangle size={12} />
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
