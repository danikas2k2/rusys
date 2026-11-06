import { Button, Group, Stack, Table, Text } from '@mantine/core';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { AmountsCell } from '~/components/amounts/AmountsCell';
import { EmailAvatar } from '~/components/common/EmailAvatar';
import { FormatDate } from '~/components/common/FormatDate';
import { Label } from '~/components/common/Label';
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
    onMoved?: () => void | Promise<void>;
}) {
    const moveConsumedToRecycled = useMoveConsumedToRecycled();
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const consumedLines = useMemo(
        () => (dimmed ? [] : (h.amounts ?? []).filter((a) => a.recycled === false && a.amount < 0)),
        [dimmed, h.amounts]
    );

    // Only ever wired to onClick when consumedLines is non-empty (see below), so no length guard needed here.
    const handleRowClick = useCallback(() => setExpanded((prev) => !prev), []);

    const handleMove = useCallback(
        async (line: VariantAmount, amount: number) => {
            setSaving(true);
            setError(false);
            const table = buttonRef.current?.closest('table');
            try {
                await moveConsumedToRecycled({
                    group: h.group,
                    name: h.name,
                    year: h.year ?? 0,
                    sourceSessionId: h.sessionId ?? `${(h.user ?? '').toLowerCase()}:${h.time}`,
                    variant: line.variant,
                    amount,
                    flags: {
                        suspicious: line.suspicious,
                        home: line.home,
                        expiresAt: line.expiresAt,
                    },
                });
                setExpanded(false);
                await onMoved?.();
                table?.focus();
            } catch {
                setError(true);
            } finally {
                setSaving(false);
            }
        },
        [h.group, h.name, h.year, h.sessionId, h.user, h.time, moveConsumedToRecycled, onMoved]
    );

    return (
        <>
            <Table.Tr opacity={dimmed ? 0.4 : undefined}>
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
                    {consumedLines.length > 0 && (
                        <Button
                            ref={buttonRef}
                            type="button"
                            variant="subtle"
                            size="xs"
                            aria-expanded={expanded}
                            onClick={handleRowClick}
                        >
                            <Label>Move to discarded</Label>
                        </Button>
                    )}
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                        {h.comment}
                    </Text>
                </Table.Td>
            </Table.Tr>
            {expanded && (
                <Table.Tr>
                    <Table.Td colSpan={2}>
                        <MoveConsumedForm group={h.group} lines={consumedLines} onMove={handleMove} disabled={saving} />
                        {error && (
                            <Text role="alert" c="red">
                                <Label>Something went wrong</Label>
                            </Text>
                        )}
                    </Table.Td>
                </Table.Tr>
            )}
        </>
    );
}
