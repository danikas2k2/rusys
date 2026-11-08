import { Divider, Flex, Loader, Table } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import React, { useDeferredValue, useEffect, useRef, useState } from 'react';

import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { AmountHistoryRow } from '~/features/products/AmountHistoryRow';
import { invalidatePendingProductHistory, useGetProductHistory } from '~/features/products/hooks/useGetProductHistory';
import type { History, Product, ProductAmounts } from '~/schema';
import { CATALOG_KEYS } from '~/store/catalog';
import { useProducts } from '~/store/products';

import './AmountHistoryTab.css';

export function AmountHistoryTab() {
    const client = useQueryClient();
    const [refreshFailed, setRefreshFailed] = useState(false);
    const errorRef = useRef<HTMLDivElement>(null);
    const [active] = useActiveContent<ProductAmounts>();
    const activeData = useDeferredValue(active?.data);
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const loader = useGetProductHistory({ year, group, name });
    const products = useProducts();
    const product = products.find((item) => item.group === group && item.name === name);
    const history = product?.history?.[year];
    const handleRefreshFailure = () => {
        setRefreshFailed(true);
        invalidatePendingProductHistory(client, { group, name, year });
        client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (items) =>
            items?.map((item) => {
                if (item.group !== group || item.name !== name || !item.history) {
                    return item;
                }
                const { [year]: _removed, ...remainingHistory } = item.history;
                return { ...item, history: remainingHistory };
            })
        );
    };

    // Each product-year owns its cache. Returning to an already visited year displays it right
    // away, while this still refreshes it in the background after every product/year change or
    // server-provided history metadata update.
    useEffect(() => {
        void loader();
    }, [loader, product?.updates, product?.undates]);

    useEffect(() => {
        if (refreshFailed) {
            errorRef.current?.focus();
        }
    }, [refreshFailed]);

    if (!group || !name) {
        return <HistoryTable updates={[]} undates={[]} />;
    }

    if (refreshFailed) {
        return (
            <div role="alert" tabIndex={-1} ref={errorRef}>
                <Label>Recycled, but refresh failed. Reload the page.</Label>
            </div>
        );
    }

    if (!history) {
        return (
            <Flex justify="center" py="xl">
                <Loader size="lg" type="bars" />
            </Flex>
        );
    }

    return (
        <HistoryTable
            updates={history.updates}
            undates={history.undates}
            loader={loader}
            onRefreshFailure={handleRefreshFailure}
        />
    );
}

function HistoryTable({
    updates,
    undates,
    loader,
    onRefreshFailure,
}: {
    updates: readonly History[];
    undates: readonly History[];
    loader?: () => Promise<void>;
    onRefreshFailure?: () => void;
}) {
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
    const [savingEntry, setSavingEntry] = useState<string | null>(null);

    return (
        <Table data-table="history" tabIndex={-1}>
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
                    <AmountHistoryRow
                        key={`${h.time}:${h.year}`}
                        h={h}
                        onMoved={loader}
                        expandedEntry={expandedEntry}
                        setExpandedEntry={setExpandedEntry}
                        savingEntry={savingEntry}
                        setSavingEntry={setSavingEntry}
                        onRefreshFailure={onRefreshFailure}
                    />
                ))}
            </Table.Tbody>
        </Table>
    );
}
