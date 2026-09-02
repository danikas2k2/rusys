import { Divider, Table } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { AmountHistoryRow } from '~/client/pages/products/AmountHistoryRow';
import { useGetProductHistory } from '~/client/state/history/useGetProductHistory';
import { useUndates } from '~/client/state/history/useUndates';
import { useUpdates } from '~/client/state/history/useUpdates';
import type { ProductAmounts } from '~/common/data';

import './AmountHistoryTab.pcss';

export function AmountHistoryTab() {
    const [active] = useActiveContent<ProductAmounts>();
    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const loader = useGetProductHistory(year, group, name);
    const updates = useUpdates();
    const undates = useUndates();

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
                    {[...undates].reverse().map((h) => (
                        <AmountHistoryRow key={`u:${h.time}:${h.year}`} h={h} dimmed />
                    ))}
                    {undates.length > 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={2} p={0}>
                                <Divider color="red" size="sm" />
                            </Table.Td>
                        </Table.Tr>
                    )}
                    {updates.map((h) => (
                        <AmountHistoryRow key={`${h.time}:${h.year}`} h={h} onMoved={loader} />
                    ))}
                </Table.Tbody>
            </Table>
        </LoadableContent>
    );
}
