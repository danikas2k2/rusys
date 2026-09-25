import { Divider, Flex, Loader, Table } from '@mantine/core';
import type { ProductAmounts } from '@rusys/common/data';
import React from 'react';

import { Label } from '~/components/common/Label';
import { LoadableContent } from '~/components/common/LoadableContent';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { AmountHistoryRow } from '~/features/products/AmountHistoryRow';
import { useGetProductHistory } from '~/store/history/useGetProductHistory';
import { useUndates } from '~/store/history/useUndates';
import { useUpdates } from '~/store/history/useUpdates';

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
        <LoadableContent
            resourceKey={`product-history:${group}:${name}:${year}`}
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
