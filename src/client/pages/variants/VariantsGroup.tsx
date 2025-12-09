import React from 'react';

import { Table } from '@mantine/core';

import { SortableContent } from '~/client/common/SortableContent';
import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { VariantsRow } from '~/client/pages/variants/VariantsRow';
import { GroupTitle } from '~/client/table/GroupTitle';
import { getId } from '~/client/utils/id';
import type { Variant } from '~/types/data';

interface VariantsGroupProps {
    reordering: boolean;
    group: string;
    variants: readonly Variant[];
}

export function VariantsGroup({ reordering, group, variants }: VariantsGroupProps): React.ReactElement {
    const quickFilter = useQuickFilterPredicate();
    const groupFilter = useGroupFilterPredicate();

    const groupVariants = variants.filter((variant) => variant.group === group);
    const hidden = !groupFilter(group) || !groupVariants.some((variant) => quickFilter(variant.variant));

    return (
        <>
            <GroupTitle colSpan={3} hidden={hidden}>
                {group}
            </GroupTitle>
            <Table.Tbody data-hidden={hidden}>
                <SortableContent items={groupVariants.map(({ variant }) => getId(group, variant))}>
                    {groupVariants.map((variant) => (
                        <VariantsRow
                            key={getId(variant.group, variant.variant)}
                            variant={variant}
                            reordering={reordering}
                            hidden={hidden || !quickFilter(variant.variant)}
                        />
                    ))}
                </SortableContent>
            </Table.Tbody>
        </>
    );
}
