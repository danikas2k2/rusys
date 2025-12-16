import { Table } from '@mantine/core';
import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import { GroupTitle } from '~/client/table/GroupTitle';
import { getId } from '~/client/utils/id';
import type { Summary } from '~/types/data';

interface SummaryGroupProps {
    group: string;
    summary: readonly Summary[];
}

export function SummaryGroup({ group, summary }: SummaryGroupProps) {
    const summaryYears = useSummaryYears();
    const groupFilter = useGroupFilterPredicate();
    const quickFilter = useQuickFilterPredicate();

    const groupSummary = summary.filter((v) => v.group === group);
    const hidden = !groupFilter(group) || !groupSummary.some(({ name }) => quickFilter(name));

    return (
        <>
            <GroupTitle colSpan={summaryYears.length + 1} hidden={hidden}>
                {group}
            </GroupTitle>
            <Table.Tbody data-hidden={hidden}>
                {groupSummary.map(({ name, years }) => (
                    <SummaryRow
                        key={getId(group, name)}
                        group={group}
                        name={name}
                        amounts={years}
                        hidden={hidden || !quickFilter(name)}
                    />
                ))}
            </Table.Tbody>
        </>
    );
}
