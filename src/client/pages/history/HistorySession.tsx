import { Table } from '@mantine/core';
import React from 'react';

import { HistoryRow } from '~/client/pages/history/HistoryRow';
import { SessionTitle } from '~/client/pages/history/SessionTitle';
import type { History } from '~/types/data';

interface HistorySessionProps {
    session: string;
    history: History[];
}

export function HistorySession({ session, history }: HistorySessionProps): React.ReactElement {
    return (
        <>
            <SessionTitle session={session} />
            <Table.Tbody>
                {history.map((h) => (
                    <HistoryRow key={h.time} history={h} />
                ))}
            </Table.Tbody>
        </>
    );
}
