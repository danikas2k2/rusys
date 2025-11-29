import React from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useFilteredVariants } from '~/client/pages/variants/hooks/useFilteredVariants';
import { useVariantsHasData } from '~/client/pages/variants/hooks/useVariantsHasData';
import { useVisibleGroups } from '~/client/pages/variants/hooks/useVisibleGroups';
import { VariantsGroup } from '~/client/pages/variants/VariantsGroup';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { mapOrder } from '~/client/utils/mapOrder';
import type { Variant, WithId } from '~/types/data';

export function VariantsTable() {
    const [, setActive] = useActiveContent();
    const handleDragStart = () => setActive();

    const reorderVariants = useReorderVariants();
    const {
        items,
        reordering,
        onDragEnd: handleDragEnd,
    } = useReorderHandler<Variant, Pick<Variant, 'group' | 'variant'>>({
        items: useFilteredVariants(),

        onReorder: (reordered, { group }) =>
            reorderVariants(
                group,
                mapOrder(
                    reordered.filter((v) => v.group === group),
                    ({ variant }) => variant
                )
            ),

        equals: (a, b) => a.group === b.group && a.variant === b.variant,

        resolve: (id: UniqueIdentifier) => {
            const [group, variant] = `${id}`.split(':', 2);
            return { group, variant };
        },
    });

    return (
        <LoadableContent loader={useGetVariants()} hasData={useVariantsHasData()}>
            <DraggableContent onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <Table>
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th />
                            <Table.Th>
                                <Title order={6}>
                                    <Label>Variant</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th ta="center">
                                <Label>Suffix</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    {useVisibleGroups().map((group) => (
                        <VariantsGroup
                            key={group}
                            reordering={reordering}
                            group={group}
                            variants={items
                                .filter((variant) => variant.group === group)
                                .map(
                                    (variant): WithId<Variant> => ({
                                        ...variant,
                                        id: `${variant.group}:${variant.variant}`,
                                    })
                                )}
                        />
                    ))}
                </Table>
            </DraggableContent>
        </LoadableContent>
    );
}
