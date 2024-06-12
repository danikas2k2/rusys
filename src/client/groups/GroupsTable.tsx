import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { isEmpty, isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GroupControls } from '~/client/groups/GroupControls';
import { Cell } from '~/client/table/Cell';
import { DragHandle } from '~/client/table/DragHandle';
import { LoadingContent } from '~/client/table/LoadingContent';
import { SortableRow } from '~/client/table/SortableRow';
import { Table } from '~/client/table/Table';
import { getChangedIndexes } from '~/client/utils/getChangedIndexes';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { matchParts } from '~/client/utils/matchParts';
import { useFilter } from '~/state/filter/useFilter';
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGroups } from '~/state/groups/useGroups';
import { useReorderGroups } from '~/state/groups/useReorderGroups';
import cx from './GroupsTable.less';

export function GroupsTable() {
    const getGroups = useGetGroups();
    const groups = useGroups();

    const filter = useFilter();
    const filteredGroups = useMemo(
        () => groups.filter((v) => matchParts(v.group, filter)).sort((a, b) => a.order - b.order),
        [filter, groups]
    );

    const initialOrder = useMemo(() => filteredGroups.map((v) => v.group), [filteredGroups]);
    const [groupOrder, setGroupOrder] = useState(initialOrder);
    useEffect(() => {
        setGroupOrder(initialOrder);
    }, [initialOrder]);

    const [activeGroup, setActiveGroup] = useState<string>();
    const onStart = useCallback(
        (group: string) => {
            if (activeGroup !== group) {
                setActiveGroup(group);
            }
        },
        [activeGroup]
    );

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => setActiveGroup(undefined));

    const reorderGroups = useReorderGroups();
    const onStop = useCallback(async () => {
        if (!isEqual(groupOrder, initialOrder)) {
            await reorderGroups(getChangedIndexes(initialOrder, groupOrder));
        }
    }, [groupOrder, initialOrder, reorderGroups]);

    const onMove = useCallback(() => {
        if (!activeGroup) {
            return;
        }
        const overlap = getOverlapIndex(ref.current);
        if (overlap >= 0) {
            const overlapGroup = groupOrder[overlap];
            if (overlapGroup) {
                const order = [...groupOrder];
                order[groupOrder.indexOf(activeGroup)] = overlapGroup;
                order[groupOrder.indexOf(overlapGroup)] = activeGroup;
                setGroupOrder(order);
            }
        }
    }, [activeGroup, groupOrder]);

    return (
        <LoadingContent loader={getGroups} hasData={!isEmpty(groups)}>
            <Table className={cx('Table')}>
                <div className={cx('SortableRows')}>
                    {groupOrder.map((group, i) => (
                        <SortableRow
                            key={group}
                            index={i}
                            ref={activeGroup === group ? ref : undefined}
                            className={cx('Row')}
                            onStart={() => onStart(group)}
                            onStop={onStop}
                            onMove={onMove}
                            handler={<DragHandle />}
                            controls={activeGroup === group ? <GroupControls /> : undefined}
                        >
                            <Cell key="name" className={cx('Name')}>
                                {group}
                            </Cell>
                        </SortableRow>
                    ))}
                </div>
            </Table>
        </LoadingContent>
    );
}
