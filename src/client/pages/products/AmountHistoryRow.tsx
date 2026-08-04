import { Group, Stack, Table, Text } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { AmountsCell } from '~/client/pages/products/AmountsCell';
import { EmailAvatar } from '~/client/pages/products/EmailAvatar';
import { FormatDate } from '~/client/pages/products/FormatDate';
import { MoveConsumedForm } from '~/client/pages/products/MoveConsumedForm';
import { useMoveConsumedToRecycled } from '~/client/state/products/useMoveConsumedToRecycled';
import { getRoundedDate } from '~/client/utils/time';
import type { History, VariantAmount } from '~/types/data';

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

    const handleRowClick = useCallback(() => {
        if (consumedLines.length > 0) {
            setExpanded((prev) => !prev);
        }
    }, [consumedLines.length]);

    const handleMove = useCallback(
        async (line: VariantAmount, amount: number) => {
            setSaving(true);
            try {
                // The server locates the raw entries to edit by (user, time) session — pass the
                // entry's own author, not the current viewer, regardless of who is correcting it.
                await moveConsumedToRecycled(
                    h.group,
                    h.name,
                    h.year ?? 0,
                    h.time,
                    line.variant,
                    amount,
                    { suspicious: line.suspicious, home: line.home, expiresAt: line.expiresAt },
                    h.user
                );
                setExpanded(false);
                onMoved?.();
            } finally {
                setSaving(false);
            }
        },
        [h.group, h.name, h.year, h.time, h.user, moveConsumedToRecycled, onMoved]
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
                    <AmountsCell amounts={h.amounts ?? []} />
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
