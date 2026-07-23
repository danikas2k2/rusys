import { Table } from '@mantine/core';
import React from 'react';

import { AmountViewToggle } from '~/client/common/AmountViewToggle';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';
import { SummaryYear } from '~/client/pages/summary/SummaryYear';
import { useGetSummary } from '~/client/state/summary/useGetSummary';
import { useSummary } from '~/client/state/summary/useSummary';

export function SummaryTable() {
    const summary = useSummary();
    const groups = useSortedGroups();

    const summaryYears = useSummaryYears();
    const headingWidth = 200 / (summaryYears.length + 2);

    return (
        <LoadableContent loader={useGetSummary()} hasData={useSummaryHasData()}>
            <Table layout="fixed" data-table="summary">
                <Table.Thead>
                    <Table.Tr h="3rem" bd={0}>
                        <Table.Th w={`${headingWidth}%`} py={0}>
                            <AmountViewToggle />
                        </Table.Th>
                        {summaryYears.map((year) => (
                            <Table.Th key={year}>
                                <SummaryYear year={year} />
                            </Table.Th>
                        ))}
                    </Table.Tr>
                    <Table.Tr data-shadow>
                        <Table.Th colSpan={summaryYears.length + 1} data-shadow />
                    </Table.Tr>
                </Table.Thead>
                {groups.map(({ group }) => (
                    <SummaryGroup key={group} group={group} summary={summary} />
                ))}
            </Table>
        </LoadableContent>
    );
}
