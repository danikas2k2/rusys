import React from 'react';

import { Table } from '@mantine/core';

import { ValueRow } from '~/client/pages/products/ValueRow';
import { useIsAnnual } from '~/client/state/groups/useIsAnnual';
import { useYears } from '~/client/state/years/useYears';
import { GroupTitle } from '~/client/table/GroupTitle';
import type { Product } from '~/types/data';

interface GroupProductsProps {
    group: string;
    products: readonly Product[];
}

export function GroupProducts({ group, products }: GroupProductsProps) {
    const years = useYears();
    const annual = useIsAnnual(group);

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
