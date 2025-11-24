import React from 'react';

import { Table, Title } from '@mantine/core';

import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import type { YearAmounts } from '~/types/data';

export function SummaryRow({
    group,
    name,
    amounts,
}: {
    group: string;
    name: string;
    amounts?: readonly YearAmounts[];
}) {
    return (
        <Table.Tr>
            <Table.Td ps="1rem">
                <Title order={6}>{name}</Title>
            </Table.Td>
            {useSummaryYears().map((year) => (
                <SummaryCell key={year} group={group} amounts={amounts?.find((y) => y.year === year)?.amounts} />
            ))}
        </Table.Tr>
    );
}
