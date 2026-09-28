import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';
import React, { useMemo } from 'react';

import type { Variant } from '~/common/data';
import { DraggableContent } from '~/components/common/DraggableContent';
import { Label } from '~/components/common/Label';
import { LoadableContent } from '~/components/common/LoadableContent';
import { SortableContent } from '~/components/common/SortableContent';
import { useReorderHandler } from '~/components/hooks/useReorderHandler';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { DragOverlayTable } from '~/components/table/DragOverlayTable';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { useSortedVariants } from '~/features/variants/hooks/useSortedVariants';
import { useVariantsHasData } from '~/features/variants/hooks/useVariantsHasData';
import { VariantsRow } from '~/features/variants/VariantsRow';
import { getId, parseId } from '~/lib/utils/id';
import { mapOrder } from '~/lib/utils/mapOrder';
import { useGetVariants } from '~/store/variants/useGetVariants';
import { useReorderVariants } from '~/store/variants/useReorderVariants';

import './VariantsTable.css';

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
        <LoadableContent resourceKey="variants" loader={useGetVariants()} hasData={useVariantsHasData()}>
            <DraggableContent
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                renderDragOverlay={renderDragOverlay}
            >
                <Table layout="fixed" data-table="variants">
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th w="2.2rem" />
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
