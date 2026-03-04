import { Center, Loader, Table, Text } from '@mantine/core';
import React, { useCallback, useEffect, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountsCell } from '~/client/pages/history/AmountsCell';
import { useHistoryUpdating } from '~/client/pages/history/UpdatingHistoryContext';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { formatTime } from '~/client/utils/time';
import type { History } from '~/types/data';

interface HistoryRowProps {
    history: History;
}

export function HistoryRow({ history: h }: HistoryRowProps): React.ReactElement {
    const [, setActive] = useActiveContent<History>();
    const updating = useHistoryUpdating({
        time: h.time,
        group: h.group,
        name: h.name,
        year: h.year,
        user: h.user,
    });
    const id = h.sessionId ?? `${h.time}`;

    const [loaderVisible, setLoaderVisible] = useState(false);

    useEffect(() => {
        if (updating) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync loader visibility with updating state
            setLoaderVisible(true);
        }
    }, [updating]);

    const handleTransitionEnd = useCallback(() => {
        if (!updating) {
            setLoaderVisible(false);
        }
    }, [updating]);

    const handleClick = useCallback(() => setActive({ action: 'values', id, data: h }), [setActive, id, h]);

    return (
        <SwipeableRow id={id} data={h} data-group={h.group} data-updating={updating} onClick={handleClick}>
            <Table.Td>{formatTime(new Date(h.time))}</Table.Td>
            <Table.Td>
                {h.name}
                <Text size="xs" c="dimmed">
                    {h.group}
                </Text>
            </Table.Td>
            <Table.Td>{h.year ?? '-'}</Table.Td>
            <Table.Td data-cell data-updating={updating}>
                <Center>
                    <AmountsCell amounts={h.amounts ?? []} />
                </Center>
                {loaderVisible && <Loader data-visible={updating} size="sm" onTransitionEnd={handleTransitionEnd} />}
            </Table.Td>
        </SwipeableRow>
    );
}
