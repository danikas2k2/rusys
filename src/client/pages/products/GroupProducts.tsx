import React, { memo } from 'react';

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

function GroupProductsComponent({ group, products }: GroupProductsProps) {
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
                        allYears={years}
                    />
                ))}
            </Table.Tbody>
        </>
    );
}

const areGroupProductsEqual = (prev: GroupProductsProps, next: GroupProductsProps): boolean =>
    prev.group === next.group &&
    prev.products.length === next.products.length &&
    prev.products.every((product, index) => product === next.products[index]);

export const GroupProducts = memo(GroupProductsComponent, areGroupProductsEqual);
