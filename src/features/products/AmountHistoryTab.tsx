import { Divider, Flex, Loader, Table } from '@mantine/core';
import React, { useDeferredValue, useEffect } from 'react';

import type { History, ProductAmounts } from '~/common/data';
import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { AmountHistoryRow } from '~/features/products/AmountHistoryRow';
import { useGetProductHistory } from '~/store/history/useGetProductHistory';
import { useProducts } from '~/store/products/useProducts';

export function AmountHistoryTab() {
    const [active] = useActiveContent<ProductAmounts>();
    const activeData = useDeferredValue(active?.data);
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const loader = useGetProductHistory(year, group, name);
    const products = useProducts();
    const product = products.find((item) => item.group === group && item.name === name);
    const history = product?.history?.[year];

    // Each product-year owns its cache. Returning to an already visited year displays it right
    // away, while this still refreshes it in the background after every product/year change or
    // server-provided history metadata update.
    useEffect(() => {
        void loader();
    }, [loader, product?.updates, product?.undates]);

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

    return <HistoryTable updates={history.updates} undates={history.undates} loader={loader} />;
}

function HistoryTable({
    updates,
    undates,
    loader,
}: {
    updates: readonly History[];
    undates: readonly History[];
    loader?: () => Promise<void>;
}) {
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
    );
}
