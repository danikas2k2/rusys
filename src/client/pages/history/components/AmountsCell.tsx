import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconToolsKitchen2, IconTrash } from '@tabler/icons-react';
import React from 'react';

import type { VariantAmount } from '~/types/data';

export function AmountsCell({ amounts }: { amounts: readonly VariantAmount[] }): React.ReactElement {
    // Server should filter empty entries, but keep safe fallback.
    if (!amounts.length) {
        return (
            <Text size="sm" c="dimmed">
                —
            </Text>
        );
    }

    const sorted = [...amounts].sort((a, b) => a.variant.localeCompare(b.variant));

    return (
        <Stack gap={4}>
            {sorted.map((a) => {
                const recycled = !!a.recycled;
                const typeLabel = recycled ? 'Recycled' : 'Consumed';
                const color = recycled ? 'red' : 'green';
                const Icon = recycled ? IconTrash : IconToolsKitchen2;

                return (
                    <Group
                        key={`${a.variant}-${a.amount}-${recycled ? 'r' : 'c'}`}
                        justify="space-between"
                        wrap="nowrap"
                        gap="xs"
                    >
                        <Group wrap="nowrap" gap="xs">
                            <ThemeIcon size="sm" variant="light" color={color} title={typeLabel} aria-label={typeLabel}>
                                <Icon size={14} />
                            </ThemeIcon>
                            <Text size="sm">{a.variant}</Text>
                        </Group>
                        <Text size="sm" fw={500} c={a.amount > 0 ? 'green' : a.amount < 0 ? 'red' : undefined}>
                            {a.amount > 0 ? `+${a.amount}` : a.amount < 0 ? `−${Math.abs(a.amount)}` : '0'}
                        </Text>
                    </Group>
                );
            })}
        </Stack>
    );
}


