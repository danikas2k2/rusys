import React from 'react';

import { Table, Title } from '@mantine/core';

import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import type { YearAmounts } from '~/types/data';

export function SummaryRow({
    group,
    name,
    amounts,
    hidden = false,
}: {
    group: string;
    name: string;
    amounts?: readonly YearAmounts[];
    hidden?: boolean;
}) {
    const years = useSummaryYears();
    return (
        <Table.Tr data-hidden={hidden}>
            <Table.Td ps="1rem">
                <Title order={6}>{name}</Title>
            </Table.Td>
            {years.map((year) => (
                <SummaryCell key={year} group={group} amounts={amounts?.find((y) => y.year === year)?.amounts} />
            ))}
        </Table.Tr>
    );
}
