import { Group, Stack, Table, Text } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { AmountsCell } from '~/components/amounts/AmountsCell';
import { EmailAvatar } from '~/components/common/EmailAvatar';
import { FormatDate } from '~/components/common/FormatDate';
import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';
import { MoveConsumedForm } from '~/features/products/MoveConsumedForm';
import { getRoundedDate } from '~/lib/utils/time';
import type { History, VariantAmount } from '~/schema';

export function AmountHistoryRow({
    h,
    dimmed = false,
    onMoved,
}: {
    h: History;
    dimmed?: boolean;
    onMoved?: () => void;
}) {
    const moveConsumedToRecycled = useMoveConsumedToRecycled();
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);

    const consumedLines = useMemo(
        () => (dimmed ? [] : (h.amounts ?? []).filter((a) => a.recycled === false && a.amount < 0)),
        [dimmed, h.amounts]
    );

    // Only ever wired to onClick when consumedLines is non-empty (see below), so no length guard needed here.
    const handleRowClick = useCallback(() => setExpanded((prev) => !prev), []);

    const handleMove = useCallback(
        async (line: VariantAmount, amount: number) => {
            setSaving(true);
            try {
                await moveConsumedToRecycled({
                    group: h.group,
                    name: h.name,
                    year: h.year ?? 0,
                    variant: line.variant,
                    amount,
                    flags: {
                        suspicious: line.suspicious,
                        home: line.home,
                        expiresAt: line.expiresAt,
                    },
                });
                setExpanded(false);
                onMoved?.();
            } finally {
                setSaving(false);
            }
        },
        [h.group, h.name, h.year, moveConsumedToRecycled, onMoved]
    );

    return (
        <>
            <Table.Tr
                opacity={dimmed ? 0.4 : undefined}
                onClick={consumedLines.length > 0 ? handleRowClick : undefined}
                style={consumedLines.length > 0 ? { cursor: 'pointer' } : undefined}
            >
                <Table.Td>
                    <Stack gap={2}>
                        <Group wrap="nowrap" gap="xs">
                            <EmailAvatar email={h.user} />
                            <Text size="sm" c={dimmed ? 'dimmed' : undefined}>
                                <FormatDate date={getRoundedDate(h.time)} />
                            </Text>
                        </Group>
                    </Stack>
                </Table.Td>
                <Table.Td>
                    <AmountsCell group={h.group} amounts={h.amounts ?? []} />
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                        {h.comment}
                    </Text>
                </Table.Td>
            </Table.Tr>
            {expanded && (
                <Table.Tr>
                    <Table.Td colSpan={2}>
                        <MoveConsumedForm group={h.group} lines={consumedLines} onMove={handleMove} disabled={saving} />
                    </Table.Td>
                </Table.Tr>
            )}
        </>
    );
}
