import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';
import React, { useMemo } from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { SortableContent } from '~/client/common/SortableContent';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useSortedVariants } from '~/client/pages/variants/hooks/useSortedVariants';
import { useVariantsHasData } from '~/client/pages/variants/hooks/useVariantsHasData';
import { VariantsRow } from '~/client/pages/variants/VariantsRow';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { DragOverlayTable } from '~/client/table/DragOverlayTable';
import { getId, parseId } from '~/client/utils/id';
import { mapOrder } from '~/client/utils/mapOrder';
import type { Variant } from '~/types/data';

import './VariantsTable.pcss';

export function VariantsTable() {
    const [selectedGroup] = useGroupFilter();
    const [filter] = useQuickFilter();
    const quickFilter = useQuickFilterPredicate();
    const dragDisabled = !!filter.trim();

    const setActive = useSetActiveContent();
    const handleDragStart = () => setActive();

    const reorderVariants = useReorderVariants();
    const allVariants = useSortedVariants();
    const variantsInGroup = useMemo(
        () => allVariants.filter((v) => v.group === selectedGroup),
        [allVariants, selectedGroup]
    );
    const {
        items: variants,
        reordering,
        onDragEnd: handleDragEnd,
    } = useReorderHandler<Variant, Pick<Variant, 'group' | 'variant'>>({
        items: variantsInGroup,

        onReorder: (reordered, { group }) =>
            reorderVariants(
                group,
                mapOrder(reordered, ({ variant }) => variant)
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
                <VariantsRow variant={variant} reordering={reordering} dragDisabled={dragDisabled} />
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
                            <Table.Th w="2rem" />
                            <Table.Th>
                                <Title order={5}>
                                    <Label>Variant</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th w="25%" ta="center">
                                <Label>Suffix</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <SortableContent items={variants.map(({ variant }) => getId(selectedGroup, variant))}>
                            {variants.map((variant) => (
                                <VariantsRow
                                    key={getId(variant.group, variant.variant)}
                                    variant={variant}
                                    reordering={reordering}
                                    dragDisabled={dragDisabled}
                                    hidden={!quickFilter(variant.variant)}
                                />
                            ))}
                        </SortableContent>
                    </Table.Tbody>
                </Table>
            </DraggableContent>
        </LoadableContent>
    );
}
