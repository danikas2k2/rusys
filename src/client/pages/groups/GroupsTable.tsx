import React, { useMemo, useRef, useState } from 'react';

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type Modifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Table } from '@mantine/core';
import { IconCalendarClock } from '@tabler/icons-react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { LoadingContent } from '~/client/common/LoadingContent';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useGroups } from '~/client/state/groups/useGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import { SortableTableRow } from '~/client/table/SortableTableRow';
import { matchParts } from '~/client/utils/matchParts';

export function GroupsTable() {
    const groups = useGroups();
    const filter = useQuickFilter();
    const reorderGroups = useReorderGroups();
    const [isReordering, setIsReordering] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const [, setActive] = useActiveContent();

    const visibleGroups = useMemo(
        () => groups.filter((v) => matchParts(v.group, filter)).sort((a, b) => a.order - b.order),
        [filter, groups]
    );

    // Freeze visible groups during reordering to prevent jumping
    const frozenGroupsRef = useRef(visibleGroups);
    const displayGroups = isReordering ? frozenGroupsRef.current : visibleGroups;

    // Update frozen groups when not reordering
    if (!isReordering) {
        frozenGroupsRef.current = visibleGroups;
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const restrictToTableBody: Modifier = useMemo(
        () =>
            ({ transform, draggingNodeRect }) => {
                if (!draggingNodeRect) {
                    return transform;
                }

                const tbody = tableRef.current?.querySelector('tbody');
                if (!tbody) {
                    return transform;
                }

                const tbodyRect = tbody.getBoundingClientRect();

                // Calculate current position of dragging element
                const currentTop = draggingNodeRect.top + transform.y;
                const currentBottom = currentTop + draggingNodeRect.height;

                // Calculate how much we need to adjust to stay within tbody bounds
                let adjustedY = transform.y;

                if (currentTop < tbodyRect.top) {
                    adjustedY = transform.y + (tbodyRect.top - currentTop);
                } else if (currentBottom > tbodyRect.bottom) {
                    adjustedY = transform.y - (currentBottom - tbodyRect.bottom);
                }

                return {
                    ...transform,
                    y: adjustedY,
                };
            },
        []
    );

    const handleDragStart = () => {
        // Close slide controls when drag starts
        setActive(undefined);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = displayGroups.findIndex((g) => g.group === active.id);
            const newIndex = displayGroups.findIndex((g) => g.group === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setIsReordering(true);

                // Update frozen groups immediately for instant UI feedback
                const reorderedGroups = [...displayGroups];
                const [movedGroup] = reorderedGroups.splice(oldIndex, 1);
                reorderedGroups.splice(newIndex, 0, movedGroup);
                frozenGroupsRef.current = reorderedGroups;

                try {
                    // Create order map with new orders
                    const orderMap: Record<string, number> = {};
                    for (const [index, group] of reorderedGroups.entries()) {
                        orderMap[group.group] = index;
                    }

                    await reorderGroups(orderMap);
                } finally {
                    setIsReordering(false);
                }
            }
        }
    };

    return (
        <LoadingContent loader={useGetGroups()} hasData={useGroupsHasData()}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToTableBody]}
            >
                <Table ref={tableRef} fz="md">
                    <Table.Thead
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            boxShadow: 'var(--shadow-xsmall)',
                            backgroundColor: 'var(--mantine-color-body)',
                        }}
                    >
                        <Table.Tr>
                            <Table.Th />
                            <Table.Th fw={600}>
                                <Label>Group</Label>
                            </Table.Th>
                            <Table.Th fw="normal" ta="center">
                                <Label>Annual</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <SortableContext
                            items={displayGroups.map((g) => g.group)}
                            strategy={verticalListSortingStrategy}
                        >
                            {displayGroups.map((g) => (
                                <SortableTableRow key={g.group} id={g.group} data={g} disabled={isReordering}>
                                    <Table.Td fw={600}>
                                        <Label>{g.group}</Label>
                                    </Table.Td>
                                    <Table.Td ta="center">
                                        {(g.annual ?? true) && <IconCalendarClock size={18} />}
                                    </Table.Td>
                                </SortableTableRow>
                            ))}
                        </SortableContext>
                    </Table.Tbody>
                </Table>
            </DndContext>
        </LoadingContent>
    );
}
