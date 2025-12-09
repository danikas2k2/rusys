import React from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { SortableContent } from '~/client/common/SortableContent';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { GroupsRow } from '~/client/pages/groups/GroupsRow';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import { DragOverlayTable } from '~/client/table/DragOverlayTable';
import { mapOrder } from '~/client/utils/mapOrder';
import { matchParts } from '~/client/utils/matchParts';
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
        items: useSortedGroups(),

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

    const [filter] = useQuickFilter();

    return (
        <LoadableContent loader={useGetGroups()} hasData={useGroupsHasData()}>
            <DraggableContent
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                renderDragOverlay={renderDragOverlay}
            >
                <Table layout="fixed" data-table="groups">
                    <Table.Thead>
                        <Table.Tr h="3rem">
                            <Table.Th w="2.25rem" />
                            <Table.Th>
                                <Title order={6}>
                                    <Label>Group</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th w="30%" ta="center">
                                <Label>Annual</Label>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <SortableContent items={items.map(({ group }) => group)}>
                            {items.map((group) => (
                                <GroupsRow
                                    key={group.group}
                                    group={group}
                                    reordering={reordering}
                                    hidden={!matchParts(group.group, filter)}
                                />
                            ))}
                        </SortableContent>
                    </Table.Tbody>
                </Table>
            </DraggableContent>
        </LoadableContent>
    );
}
