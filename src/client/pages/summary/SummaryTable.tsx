import React from 'react';

import { Table } from '@mantine/core';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useUpdateType } from '~/client/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';
import { useGetSummary } from '~/client/state/summary/useGetSummary';
import { useRecycledSummary } from '~/client/pages/summary/hooks/useRecycledSummary';

export function SummaryTable() {
    const summary = useRecycledSummary();
    const quickPredicate = useQuickFilterPredicate();
    const groupPredicate = useGroupFilterPredicate();
    const uniqueGroups = Array.from(
        summary.reduce<Set<string>>((acc, { group }) => acc.add(group), new Set<string>())
    );

    const visibleIds = new Set(
        summary
            .filter((s) => groupPredicate(s.group) && quickPredicate(s.name))
            .map((s) => `${s.group}:${s.name}`)
    );
    const visibleGroupSet = summary.reduce<Set<string>>((acc, s) => {
        if (visibleIds.has(`${s.group}:${s.name}`)) {
            acc.add(s.group);
        }
        return acc;
    }, new Set<string>());

    const summaryYears = useSummaryYears();
    const headingWidth = 300 / (summaryYears.length + 3);
    const [updateType] = useUpdateType();

    return (
        <LoadableContent loader={useGetSummary()} hasData={useSummaryHasData()}>
            <Table layout="fixed" data-table="summary" data-recycled={updateType === 'recycled'}>
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
                {uniqueGroups.map((group) => (
                    <SummaryGroup
                        key={group}
                        group={group}
                        summary={summary.filter((v) => v.group === group)}
                        hidden={!visibleGroupSet.has(group)}
                        visibleIds={visibleIds}
                    />
                ))}
            </Table>
        </LoadableContent>
    );
}
