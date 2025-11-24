import React from 'react';

import { Table } from '@mantine/core';

import { ValueRow } from '~/client/pages/details/ValueRow';
import { useIsAnnual } from '~/client/state/groups/useIsAnnual';
import { useYears } from '~/client/state/years/useYears';
import { GroupTitle } from '~/client/table/GroupTitle';
import type { Details } from '~/types/data';

interface DetailsGroupProps {
    group: string;
    details: readonly Details[];
}

export function DetailsGroup({ group, details }: DetailsGroupProps) {
    const years = useYears();
    const annual = useIsAnnual(group);

    return (
        <>
            <GroupTitle colSpan={years.length + 1} bg="blue">
                {group}
            </GroupTitle>
            <Table.Tbody>
                {details.map((d) => (
                    <ValueRow
                        key={`${d.group}:${d.name}`}
                        group={d.group}
                        name={d.name}
                        years={d.years}
                        annual={annual}
                        missing={d.missing}
                    />
                ))}
            </Table.Tbody>
        </>
    );
}
