import { Divider, Flex, Loader, Table } from '@mantine/core';
import React, { useEffect, useState } from 'react';

import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { ConsumedHistoryRow } from '~/features/products/ConsumedHistoryRow';
import { useHistoryRevision } from '~/features/products/hooks/historyCache';
import { useGetConsumedHistory } from '~/features/products/hooks/useGetConsumedHistory';
import type { History, ProductAmounts } from '~/schema';
import { useSummary } from '~/store/summary';

import './ConsumedHistoryTab.css';

export function ConsumedHistoryTab() {
    const [active] = useActiveContent<ProductAmounts>();
    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;
    const [failedKey, setFailedKey] = useState<string>();
    const key = JSON.stringify([group, name, year]);

    const revision = useHistoryRevision({ group, name });
    const loader = useGetConsumedHistory({ year, group, name });
    const summary = useSummary().find((item) => item.group === group && item.name === name);
    const history = summary?.history?.[year];

    // Each summary product-year owns its cache. Returning to a visited year displays it right
    // away, while refreshed summary data triggers a background history refresh.
    useEffect(() => {
        let current = true;
        void loader().then(
            () => {
                if (current) {
                    setFailedKey(undefined);
                }
            },
            () => {
                if (current) {
                    setFailedKey(key);
                }
            }
        );
        return () => {
            current = false;
        };
    }, [loader, summary?.years, group, name, year, key, revision]);

    if (!group || !name || !year) {
        return <HistoryTable updates={[]} undates={[]} />;
    }

    if (failedKey === key) {
        return (
            <div role="alert">
                <Label>Failed to load data</Label>
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

    return <HistoryTable updates={history.updates} undates={history.undates} />;
}

function HistoryTable({ updates, undates }: { updates: readonly History[]; undates: readonly History[] }) {
    return (
        <Table data-table="history">
            <Table.Tbody>
                {[...undates].reverse().map((h) => (
                    <ConsumedHistoryRow key={`u:${h.time}:${h.year}`} h={h} dimmed />
                ))}
                {undates.length > 0 && (
                    <Table.Tr>
                        <Table.Td colSpan={2} p={0}>
                            <Divider color="red" size="sm" />
                        </Table.Td>
                    </Table.Tr>
                )}
                {updates.map((h) => (
                    <ConsumedHistoryRow key={`${h.time}:${h.year}`} h={h} />
                ))}
            </Table.Tbody>
        </Table>
    );
}
