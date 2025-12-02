import React from 'react';

import { Table } from '@mantine/core';

import { LoadableContent } from '~/client/common/LoadableContent';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useProductFilters } from '~/client/filters/hooks/useProductFilters';
import { useSortedList } from '~/client/hooks/useSortedList';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { useRecycledSummary } from '~/client/pages/summary/hooks/useRecycledSummary';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';
import { useGetSummary } from '~/client/state/summary/useGetSummary';

export function SummaryTable() {
    const visibleSummary = useSortedList(useFilteredList(useRecycledSummary(), useProductFilters()));
    const uniqueGroups = useUniqueGroups(visibleSummary);
    const groupFilter = useGroupFilter();
    const visibleGroups = groupFilter ? [groupFilter] : uniqueGroups;
    const summaryYears = useSummaryYears();
    const headingWidth = 300 / (summaryYears.length + 3);

    return (
        <LoadableContent loader={useGetSummary()} hasData={useSummaryHasData()}>
            <Table layout="fixed">
                <Table.Thead>
                    <Table.Tr h="3rem" bd={0}>
                        <Table.Th w={`${headingWidth}%`} py={0}>
                            <UpdateTypeToggle updated={false} />
                        </Table.Th>
                        {summaryYears.map((year) => (
                            <Table.Th key={year}>
                                <sup>{year}</sup>/<sub>{year + 1}</sub>
                            </Table.Th>
                        ))}
                    </Table.Tr>
                    <Table.Tr data-shadow>
                        <Table.Th colSpan={summaryYears.length + 1} data-shadow />
                    </Table.Tr>
                </Table.Thead>
                {visibleGroups.map((group) => (
                    <SummaryGroup key={group} group={group} summary={visibleSummary.filter((v) => v.group === group)} />
                ))}
            </Table>
        </LoadableContent>
    );
}
