import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useSortedVariants } from '~/client/pages/variants/hooks/useSortedVariants';
import { useVariantsHasData } from '~/client/pages/variants/hooks/useVariantsHasData';
import { VariantsGroup } from '~/client/pages/variants/VariantsGroup';
import { VariantsRow } from '~/client/pages/variants/VariantsRow';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { DragOverlayTable } from '~/client/table/DragOverlayTable';
import { getId, parseId } from '~/client/utils/id';
import { mapOrder } from '~/client/utils/mapOrder';
import type { Variant } from '~/types/data';

export function VariantsTable() {
    const groups = useSortedGroups();

    const [, setActive] = useActiveContent();
    const handleDragStart = () => setActive();

    const reorderVariants = useReorderVariants();
    const {
        items: variants,
        reordering,
        onDragEnd: handleDragEnd,
    } = useReorderHandler<Variant, Pick<Variant, 'group' | 'variant'>>({
        items: useSortedVariants(),

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
            const [group, variant] = parseId(id, 2);
            return { group, variant };
        },
    });

    const renderDragOverlay = (activeId: UniqueIdentifier, columns: number[]) => {
        const variant = variants.find((v) => getId(v.group, v.variant) === activeId);
        return variant ? (
            <DragOverlayTable columns={columns}>
                <VariantsRow variant={variant} reordering={reordering} />
            </DragOverlayTable>
        ) : null;
    };

    return (
        <LoadableContent loader={useGetVariants()} hasData={useVariantsHasData()}>
            <DraggableContent
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                renderDragOverlay={renderDragOverlay}
            >
                <Table layout="fixed" data-table="variants">
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th w="10%" />
                            <Table.Th>
                                <Title order={5}>
                                    <Label>Variant</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th w="40%" ta="center">
                                <Label>Suffix</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    {groups.map(({ group }) => (
                        <VariantsGroup key={group} group={group} variants={variants} reordering={reordering} />
                    ))}
                </Table>
            </DraggableContent>
        </LoadableContent>
    );
}
