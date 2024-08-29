import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { isEmpty, isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Label } from '~/client/common/Label';
import { GroupControls } from '~/client/groups/GroupControls';
import { Cell } from '~/client/table/Cell';
import { DragHandle } from '~/client/table/DragHandle';
import { LoadingContent } from '~/client/table/LoadingContent';
import { Row } from '~/client/table/Row';
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

    const reorderGroups = useReorderGroups();
    const handleReorder = useCallback(
        (order: string[]) => reorderGroups(getChangedIndexes(initialOrder, order)),
        [initialOrder, reorderGroups]
    );

    const [activeGroup, setActiveGroup] = useState<string>();
    const setInactive = useCallback(() => setActiveGroup(undefined), []);

    const [pinned, setPinned] = useState(false);
    const onPin = useCallback(
        (hide = false) => {
            if (hide) {
                setInactive();
            }
            setPinned(true);
        },
        [setInactive]
    );
    const onUnpin = useCallback(
        (hide = false) => {
            if (hide) {
                setInactive();
            }
            setPinned(false);
        },
        [setInactive]
    );

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(pinned ? { current: null } : ref, setInactive);

    const onStart = useCallback(
        (group: string) => {
            if (activeGroup !== group) {
                setActiveGroup(group);
            }
        },
        [activeGroup]
    );

    const onStop = useCallback(() => {
        if (!isEqual(groupOrder, groups)) {
            void handleReorder(groupOrder);
        }
    }, [groupOrder, groups, handleReorder]);

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
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell />
                        <Cell key="name" role="columnheader" className={cx('Name')}>
                            <Label>Group</Label>
                        </Cell>
                    </Row>
                }
            >
                <div className={cx('SortableRows')}>
                    {groupOrder.map((group, i) => {
                        const active = activeGroup === group;
                        return (
                            <SortableRow
                                key={group}
                                index={i}
                                ref={active ? ref : undefined}
                                className={cx('Row')}
                                handle={<DragHandle onPointerDown={setInactive} />}
                                controls={active && <GroupControls group={group} onPin={onPin} onUnpin={onUnpin} />}
                                onStart={() => onStart(group)}
                                onStop={onStop}
                                onMove={onMove}
                            >
                                <Cell key="name" className={cx('Name')}>
                                    {group}
                                </Cell>
                            </SortableRow>
                        );
                    })}
                </div>
            </Table>
        </LoadingContent>
    );
}
