import { Table } from '@mantine/core';
import React from 'react';

import { AmountViewToggle } from '~/client/common/AmountViewToggle';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import { SummaryYear } from '~/client/pages/summary/SummaryYear';
import { useGetSummary } from '~/client/state/summary/useGetSummary';
import { useSummary } from '~/client/state/summary/useSummary';
import { getId } from '~/client/utils/id';

export function SummaryTable() {
    const [selectedGroup] = useGroupFilter();
    const summary = useSummary().filter((v) => v.group === selectedGroup);
    const quickFilter = useQuickFilterPredicate();

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
                <Table.Tbody>
                    {summary.map(({ name, years }) => (
                        <SummaryRow
                            key={getId(selectedGroup, name)}
                            group={selectedGroup}
                            name={name}
                            amounts={years}
                            hidden={!quickFilter(name)}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </LoadableContent>
    );
}
