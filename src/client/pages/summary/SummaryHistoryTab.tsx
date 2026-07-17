import { Divider, Group, Stack, Table, Text } from '@mantine/core';
import React, { useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useUpdateType } from '~/client/common/UpdateTypeContext';
import { AmountsCell } from '~/client/pages/products/AmountsCell';
import { EmailAvatar } from '~/client/pages/products/EmailAvatar';
import { FormatDate } from '~/client/pages/products/FormatDate';
import { type SummaryHistoryData } from '~/client/pages/summary/SummaryCell';
import { useGetSummaryHistory } from '~/client/state/history/useGetSummaryHistory';
import { useUndates } from '~/client/state/history/useUndates';
import { useUpdates } from '~/client/state/history/useUpdates';
import { getRoundedDate } from '~/client/utils/time';
import type { History } from '~/types/data';

function filterByRecycled(entries: readonly History[], recycled: boolean): History[] {
    return entries
        .map((h) => ({
            ...h,
            amounts: h.amounts?.filter((a) => !!a.recycled === recycled),
        }))
        .filter((h) => h.amounts && h.amounts.length > 0);
}

function HistoryRow({ h, dimmed = false }: { h: History; dimmed?: boolean }) {
    return (
        <Table.Tr opacity={dimmed ? 0.4 : undefined}>
            <Table.Td>
                <Stack gap={2}>
                    <Group wrap="nowrap" gap="xs">
                        <EmailAvatar email={h.user} />
                        <Text size="sm" c={dimmed ? 'dimmed' : undefined}>
                            <FormatDate date={getRoundedDate(h.time)} />
                        </Text>
                    </Group>
                    {h.comment && (
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                            {h.comment}
                        </Text>
                    )}
                </Stack>
            </Table.Td>
            <Table.Td>
                <AmountsCell amounts={h.amounts ?? []} />
            </Table.Td>
        </Table.Tr>
    );
}

export function SummaryHistoryTab() {
    const [active] = useActiveContent<SummaryHistoryData>();
    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const [updateType] = useUpdateType();
    const recycled = updateType === 'recycled';

    const loader = useGetSummaryHistory(year, group, name);
    const updates = useUpdates();
    const undates = useUndates();

    const filteredUpdates = useMemo(() => filterByRecycled(updates, recycled), [updates, recycled]);
    const filteredUndates = useMemo(() => filterByRecycled(undates, recycled), [undates, recycled]);

    return (
        <LoadableContent loader={loader} hasData>
            <Table data-table="history">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>
                            <Label>When</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>What</Label>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {[...filteredUndates].reverse().map((h) => (
                        <HistoryRow key={`u:${h.time}:${h.year}`} h={h} dimmed />
                    ))}
                    {filteredUndates.length > 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={2} p={0}>
                                <Divider color="red" size="sm" />
                            </Table.Td>
                        </Table.Tr>
                    )}
                    {filteredUpdates.map((h) => (
                        <HistoryRow key={`${h.time}:${h.year}`} h={h} />
                    ))}
                </Table.Tbody>
            </Table>
        </LoadableContent>
    );
}
