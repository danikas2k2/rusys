import React from 'react';

import { Table } from '@mantine/core';

import { useUpdateType } from '~/client/common/UpdateTypeContext';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import { GroupTitle } from '~/client/table/GroupTitle';
import type { Summary } from '~/types/data';

interface SummaryGroupProps {
    group: string;
    summary: readonly Summary[];
}

export function SummaryGroup({ group, summary }: SummaryGroupProps) {
    const summaryYears = useSummaryYears();

    return (
        <>
            <GroupTitle colSpan={summaryYears.length + 1}>{group}</GroupTitle>
            {!!summary.length && (
                <Table.Tbody>
                    {summary.map(({ name, years }) => (
                        <SummaryRow key={name} group={group} name={name} amounts={years} />
                    ))}
                </Table.Tbody>
            )}
        </>
    );
}
