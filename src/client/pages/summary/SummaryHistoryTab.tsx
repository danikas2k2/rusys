import { Divider, Flex, Loader, Table } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { type SummaryHistoryData } from '~/client/pages/summary/SummaryAmounts';
import { SummaryHistoryRow } from '~/client/pages/summary/SummaryHistoryRow';
import { useGetSummaryHistory } from '~/client/state/history/useGetSummaryHistory';
import { useUndates } from '~/client/state/history/useUndates';
import { useUpdates } from '~/client/state/history/useUpdates';

import './SummaryHistoryTab.pcss';

export function SummaryHistoryTab() {
    const [active] = useActiveContent<SummaryHistoryData>();
    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const loader = useGetSummaryHistory(year, group, name);
    const updates = useUpdates();
    const undates = useUndates();

    return (
        <LoadableContent
            resourceKey={`summary-history:${group}:${name}:${year}`}
            loader={loader}
            hasData
            fallback={
                <Flex justify="center" py="xl">
                    <Loader size="lg" type="bars" />
                </Flex>
            }
        >
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
        </LoadableContent>
    );
}
