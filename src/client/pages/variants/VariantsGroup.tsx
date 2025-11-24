import React from 'react';

import { Table } from '@mantine/core';

import { SortableContent } from '~/client/common/SortableContent';
import { VariantsRow } from '~/client/pages/variants/VariantsRow';
import { GroupTitle } from '~/client/table/GroupTitle';
import type { Variant, WithId } from '~/types/data';

interface VariantsGroupProps {
    reordering: boolean;
    group: string;
    variants: WithId<Variant>[];
}

export function VariantsGroup({ reordering, group, variants }: VariantsGroupProps): React.ReactElement {
    return (
        <>
            <GroupTitle colSpan={3} bg="overlay2">
                {group}
            </GroupTitle>
            <Table.Tbody>
                <SortableContent items={variants.map(({ id }) => id)}>
                    {variants.map((variant) => (
                        <VariantsRow key={variant.id} variant={variant} reordering={reordering} />
                    ))}
                </SortableContent>
            </Table.Tbody>
        </>
    );
}
