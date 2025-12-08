import React from 'react';

import { Table } from '@mantine/core';

import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import { GroupTitle } from '~/client/table/GroupTitle';
import type { Summary } from '~/types/data';

interface SummaryGroupProps {
    group: string;
    summary: readonly Summary[];
    hidden?: boolean;
    visibleIds: ReadonlySet<string>;
}

export function SummaryGroup({ group, summary, hidden = false, visibleIds }: SummaryGroupProps) {
    const summaryYears = useSummaryYears();

    return (
        <>
            <GroupTitle colSpan={summaryYears.length + 1} hidden={hidden}>
                {group}
            </GroupTitle>
            {!!summary.length && (
                <Table.Tbody data-hidden={hidden}>
                    {summary.map(({ name, years }) => {
                        const id = `${group}:${name}`;
                        const rowHidden = hidden || !visibleIds.has(id);
                        return <SummaryRow key={id} group={group} name={name} amounts={years} hidden={rowHidden} />;
                    })}
                </Table.Tbody>
            )}
        </>
    );
}
