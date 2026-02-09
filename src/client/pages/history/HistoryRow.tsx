import { Table, Text } from '@mantine/core';
import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountsCell } from '~/client/pages/history/AmountsCell';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { formatTime } from '~/client/utils/time';
import type { History } from '~/types/data';

interface HistoryRowProps {
    history: History;
}

export function HistoryRow({ history: h }: HistoryRowProps): React.ReactElement {
    const [, setActive] = useActiveContent<History>();
    const id = h.sessionId ?? `${h.time}`;

    const handleClick = useCallback(() => setActive({ action: 'values', id, data: h }), [setActive, id, h]);

    return (
        <SwipeableRow id={id} data={h} data-group={h.group} onClick={handleClick}>
            <Table.Td>{formatTime(new Date(h.time))}</Table.Td>
            <Table.Td>
                {h.name}
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
