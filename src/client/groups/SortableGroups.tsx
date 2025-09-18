import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { isEqual } from 'lodash';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { SortableGroup, type ActiveGroup } from '~/client/groups/SortableGroup';
import { getChangedIndexes } from '~/client/utils/getChangedIndexes';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { useReorderGroups } from '~/state/groups/useReorderGroups';
import { type Group } from '~/types/data';
import cx from './SortableGroups.pcss';

interface SortableGroupsProps {
    className?: string;
    groups: Group[];
}

export function SortableGroups({ className, groups }: SortableGroupsProps) {
    const initialOrder = useMemo(() => groups.map((v) => v.group), [groups]);
    const [groupOrder, setGroupOrder] = useState(initialOrder);
    useEffect(() => {
        setGroupOrder(initialOrder);
    }, [initialOrder]);

    const reorderGroups = useReorderGroups();
    const handleReorder = useCallback(
        (order: string[]) => void reorderGroups(getChangedIndexes(initialOrder, order)),
        [initialOrder, reorderGroups]
    );

    const handleDragStop = useCallback(() => {
        if (!isEqual(groupOrder, initialOrder)) {
            handleReorder(groupOrder);
        }
    }, [groupOrder, handleReorder, initialOrder]);

    const [active] = useActiveRow<ActiveGroup>();

    const handleDrag = useCallback(
        (current: HTMLDivElement) => {
            if (active?.group) {
                const overlap = getOverlapIndex(current);
                if (overlap >= 0) {
                    const overlapGroup = groupOrder[overlap];
                    if (overlapGroup) {
                        const order = [...groupOrder];
                        order[groupOrder.indexOf(active?.group)] = overlapGroup;
                        order[groupOrder.indexOf(overlapGroup)] = active?.group;
                        setGroupOrder(order);
                    }
                }
            }
        },
        [active?.group, groupOrder]
    );

    return (
        <div className={cx('SortableRows')}>
            {groupOrder.map((group, i) => {
                const groupDetails = groups.find((g) => g.group === group);
                return (
                    groupDetails && (
                        <SortableGroup
                            key={group}
                            index={i}
                            group={groupDetails}
                            className={className}
                            onDrag={handleDrag}
                            onDragStop={handleDragStop}
                        />
                    )
                );
            })}
        </div>
    );
}
