import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';
import React from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { SortableContent } from '~/client/common/SortableContent';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { GroupsRow } from '~/client/pages/groups/GroupsRow';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import { DragOverlayTable } from '~/client/table/DragOverlayTable';
import { parseId } from '~/client/utils/id';
import { mapOrder } from '~/client/utils/mapOrder';
import type { Group } from '~/types/data';

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

    const quickFilter = useQuickFilterPredicate();

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
                            <Table.Th w="10%" />
                            <Table.Th>
                                <Title order={5}>
                                    <Label>Group</Label>
                                </Title>
                            </Table.Th>
                            <Table.Th w="40%" ta="center">
                                <Label>Annual</Label>
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
