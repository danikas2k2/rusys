import { Divider, Flex, Loader, Table } from '@mantine/core';
import React, { useEffect } from 'react';

import type { History } from '~/common/data';
import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { useGetSummaryHistory } from '~/features/summary/hooks/useGetSummaryHistory';
import { type SummaryHistoryData } from '~/features/summary/SummaryAmounts';
import { SummaryHistoryRow } from '~/features/summary/SummaryHistoryRow';
import { useSummary } from '~/store/summary/useSummary';

import './SummaryHistoryTab.css';

export function SummaryHistoryTab() {
    const [active] = useActiveContent<SummaryHistoryData>();
    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const loader = useGetSummaryHistory(year, group, name);
    const summary = useSummary().find((item) => item.group === group && item.name === name);
    const history = summary?.history?.[year];

    // Each summary product-year owns its cache. Returning to a visited year displays it right
    // away, while refreshed summary data triggers a background history refresh.
    useEffect(() => {
        void loader();
    }, [loader, summary?.years]);

    if (!group || !name) {
        return <HistoryTable updates={[]} undates={[]} />;
    }

    if (!history) {
        return (
            <Flex justify="center" py="xl">
                <Loader size="lg" type="bars" />
            </Flex>
        );
    }

    return <HistoryTable updates={history.updates} undates={history.undates} />;
}

function HistoryTable({ updates, undates }: { updates: readonly History[]; undates: readonly History[] }) {
    return (
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
                {[...undates].reverse().map((h) => (
                    <SummaryHistoryRow key={`u:${h.time}:${h.year}`} h={h} dimmed />
                ))}
                {undates.length > 0 && (
                    <Table.Tr>
                        <Table.Td colSpan={2} p={0}>
                            <Divider color="red" size="sm" />
                        </Table.Td>
                    </Table.Tr>
                )}
                {updates.map((h) => (
                    <SummaryHistoryRow key={`${h.time}:${h.year}`} h={h} />
                ))}
            </Table.Tbody>
        </Table>
    );
}
