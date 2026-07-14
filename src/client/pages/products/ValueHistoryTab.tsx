import { Group, Table, Text } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { AmountsCell } from '~/client/pages/products/AmountsCell';
import { EmailAvatar } from '~/client/pages/products/EmailAvatar';
import { FormatDate } from '~/client/pages/products/FormatDate';
import { useGetHistory } from '~/client/state/history/useGetHistory';
import { useHistory } from '~/client/state/history/useHistory';
import { getRoundedDate } from '~/client/utils/time';
import type { ProductAmounts } from '~/types/data';

export function ValueHistoryTab() {
    const [active] = useActiveContent<ProductAmounts>();
    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const loader = useGetHistory(year, group, name);
    const history = useHistory();
    const hasData = history.length > 0;

    return (
        <LoadableContent loader={loader} hasData={hasData}>
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
                    {history.map((h) => (
                        <Table.Tr key={`${h.time}:${h.year}`}>
                            <Table.Td>
                                <Group wrap="nowrap" gap="xs">
                                    <EmailAvatar email={h.user} />
                                    <Text size="sm">
                                        <FormatDate date={getRoundedDate(h.time)} />
                                    </Text>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <AmountsCell amounts={h.amounts ?? []} />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </LoadableContent>
    );
}
