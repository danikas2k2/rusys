import React, { memo } from 'react';

import { Table } from '@mantine/core';

import { ValueRow } from '~/client/pages/products/ValueRow';
import { useVisibleProductsByGroup } from '~/client/pages/products/VisibleProductsContext';
import { useIsAnnual } from '~/client/state/groups/useIsAnnual';
import { useYears } from '~/client/state/years/useYears';
import { GroupTitle } from '~/client/table/GroupTitle';

interface GroupProductsProps {
    group: string;
}

function GroupProductsComponent({ group }: GroupProductsProps) {
    const years = useYears();
    const annual = useIsAnnual(group);
    const products = useVisibleProductsByGroup(group);

    return (
        <>
            <GroupTitle colSpan={years.length + 1} bg="blue">
                {group}
            </GroupTitle>
            <Table.Tbody>
                {products.map((d) => (
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

export const GroupProducts = memo(GroupProductsComponent);
