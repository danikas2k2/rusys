import React from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { SortableContent } from '~/client/common/SortableContent';
import { GroupsRow } from '~/client/pages/groups/GroupsRow';
import { useFilteredGroups } from '~/client/pages/groups/hooks/useFilteredGroups';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import { DragOverlayTable } from '~/client/table/DragOverlayTable';
import { mapOrder } from '~/client/utils/mapOrder';
import type { Group } from '~/types/data';

export function GroupsTable() {
    const [, setActive] = useActiveContent();
    const handleDragStart = () => setActive();

    const reorderGroups = useReorderGroups();
    const {
        items,
        reordering,
        onDragEnd: handleDragEnd,
    } = useReorderHandler<Group, Pick<Group, 'group'>>({
        items: useFilteredGroups(),

        onReorder: (reordered) => reorderGroups(mapOrder(reordered, ({ group }) => group)),

        equals: (a, b) => a.group === b.group,

        resolve: (id: UniqueIdentifier) => ({ group: `${id}` }),
    });

    const renderDragOverlay = (activeId: UniqueIdentifier, columns: number[]) => {
        const group = items.find((g) => g.group === activeId);
        return group ? (
            <DragOverlayTable columns={columns}>
                <GroupsRow group={group} reordering={reordering} />
            </DragOverlayTable>
        ) : null;
    };

    return (
        <LoadableContent loader={useGetGroups()} hasData={useGroupsHasData()}>
            <DraggableContent
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                renderDragOverlay={renderDragOverlay}
            >
                <Table data-table="groups">
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th />
                            <Table.Th>
                                <Title order={6}>
                                    <Label>Group</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th ta="center">
                                <Label>Annual</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <SortableContent items={items.map(({ group }) => group)}>
                            {items.map((group) => (
                                <GroupsRow key={group.group} group={group} reordering={reordering} />
                            ))}
                        </SortableContent>
                    </Table.Tbody>
                </Table>
            </DraggableContent>
        </LoadableContent>
    );
}
