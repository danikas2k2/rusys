import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';
import React from 'react';

import type { Group } from '~/common/data';
import { DraggableContent } from '~/components/common/DraggableContent';
import { Label } from '~/components/common/Label';
import { LoadableContent } from '~/components/common/LoadableContent';
import { SortableContent } from '~/components/common/SortableContent';
import { useReorderHandler } from '~/components/hooks/useReorderHandler';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { DragOverlayTable } from '~/components/table/DragOverlayTable';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { GroupsRow } from '~/features/groups/GroupsRow';
import { useGroupsHasData } from '~/features/groups/hooks/useGroupsHasData';
import { useSortedGroups } from '~/features/groups/hooks/useSortedGroups';
import { parseId } from '~/lib/utils/id';
import { mapOrder } from '~/lib/utils/mapOrder';
import { useGetGroups } from '~/store/groups/useGetGroups';
import { useReorderGroups } from '~/store/groups/useReorderGroups';

export function GroupsTable() {
    const setActive = useSetActiveContent();
    const handleDragStart = () => setActive();

    const reorderGroups = useReorderGroups();
    const {
        items: groups,
        reordering,
        onDragEnd: handleDragEnd,
    } = useReorderHandler<Group, Pick<Group, 'group'>>({
        items: useSortedGroups(),

        onReorder: (reordered) => reorderGroups(mapOrder(reordered, ({ group }) => group)),

        equals: (a, b) => a.group === b.group,

        resolve: (id: UniqueIdentifier) => ({ group: parseId(id, 1)[0] }),
    });

    const renderDragOverlay = (activeId: UniqueIdentifier, columns: number[]) => {
        const group = groups.find((g) => g.group === activeId);
        return group ? (
            <DragOverlayTable columns={columns}>
                <GroupsRow group={group} reordering={reordering} />
            </DragOverlayTable>
        ) : null;
    };

    const [filter] = useQuickFilter();
    const quickFilter = useQuickFilterPredicate();
    const dragDisabled = !!filter.trim();

    return (
        <LoadableContent resourceKey="groups" loader={useGetGroups()} hasData={useGroupsHasData()}>
            <DraggableContent
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                renderDragOverlay={renderDragOverlay}
            >
                <Table layout="fixed" data-table="groups">
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th w="2.2rem" />
                            <Table.Th w="2.2rem" />
                            <Table.Th>
                                <Title order={5}>
                                    <Label>Category</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th w="25%" ta="center">
                                <Label>Annual</Label>
                            </Table.Th>
                            <Table.Th w="25%" ta="center">
                                <Label>Review</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <SortableContent items={groups.map(({ group }) => group)}>
                            {groups.map((group) => (
                                <GroupsRow
                                    key={group.group}
                                    group={group}
                                    reordering={reordering}
                                    dragDisabled={dragDisabled}
                                    hidden={!quickFilter(group.group)}
                                />
                            ))}
                        </SortableContent>
                    </Table.Tbody>
                </Table>
            </DraggableContent>
        </LoadableContent>
    );
}
