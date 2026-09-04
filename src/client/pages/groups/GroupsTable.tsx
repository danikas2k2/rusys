import type { UniqueIdentifier } from '@dnd-kit/core';
import { Table, Title } from '@mantine/core';
import type { Group } from '@rusys/common/data';
import React from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { SortableContent } from '~/client/common/SortableContent';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { GroupsRow } from '~/client/pages/groups/GroupsRow';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import { DragOverlayTable } from '~/client/table/DragOverlayTable';
import { parseId } from '~/client/utils/id';
import { mapOrder } from '~/client/utils/mapOrder';

import './GroupsTable.pcss';

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
        <LoadableContent loader={useGetGroups()} hasData={useGroupsHasData()}>
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
