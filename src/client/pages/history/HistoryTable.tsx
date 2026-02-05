import { Table } from '@mantine/core';
import React from 'react';

import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useYearFilter } from '~/client/filters/YearFilterContext';
import { HistoryMissingData } from '~/client/pages/history/HistoryMissingData';
import { HistorySession } from '~/client/pages/history/HistorySession';
import { useHistoryHasData } from '~/client/pages/history/hooks/useHistoryHasData';
import { useHistorySessions } from '~/client/pages/history/hooks/useHistorySessions';
import { useGetHistory } from '~/client/state/history/useGetHistory';

export function HistoryTable(): React.ReactElement {
    const [year] = useYearFilter();
    const hasData = useHistoryHasData();
    const sessions = useHistorySessions();

    return (
        <LoadableContent loader={useGetHistory(year)} hasData>
            {hasData ? (
                <Table layout="fixed" data-table="history">
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th>
                                <Label>Time</Label>
                            </Table.Th>
                            <Table.Th>
                                <Label>Name</Label>
                            </Table.Th>
                            <Table.Th>
                                <Label>Year</Label>
                            </Table.Th>
                            <Table.Th>
                                <Label>Amounts</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    {Object.entries(sessions).map(([s, hs]) => (
                        <HistorySession key={s} session={s} history={hs} />
                    ))}
                </Table>
            ) : (
                <HistoryMissingData />
            )}
        </LoadableContent>
    );
}
