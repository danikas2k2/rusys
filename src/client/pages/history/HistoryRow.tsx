import { Table, Text } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountsCell } from '~/client/pages/history/components/AmountsCell';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { formatTime } from '~/client/utils/time';
import type { History } from '~/types/data';

interface HistoryRowProps {
    history: History;
}

export function HistoryRow({ history: h }: HistoryRowProps): React.ReactElement {
    const [, setActive] = useActiveContent<History>();
    const id = h.sessionId ?? `${h.time}`;

    return (
        <SwipeableRow id={id} data={h} data-group={h.group} onClick={() => setActive({ id, data: h })}>
            <Table.Td>{formatTime(new Date(h.time))}</Table.Td>
            <Table.Td>
                <Text size="sm">{h.name}</Text>
                <Text size="xs" c="dimmed">
                    {h.group}
                </Text>
            </Table.Td>
            <Table.Td>{h.year ?? '-'}</Table.Td>
            <Table.Td>
                <AmountsCell amounts={h.amounts ?? []} />
            </Table.Td>
        </SwipeableRow>
    );
}
