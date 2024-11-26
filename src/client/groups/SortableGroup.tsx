import React, { useCallback, useRef } from 'react';
import { type ActiveRow, useActiveRow } from '~/client/common/ActiveRowContext';
import { GroupControls } from '~/client/groups/GroupControls';
import { Cell } from '~/client/table/Cell';
import { DragHandle } from '~/client/table/DragHandle';
import { SortableRow } from '~/client/table/SortableRow';
import type { Group } from '~/common/types';
import cx from './SortableGroup.less';

export interface ActiveGroup extends ActiveRow, Pick<Group, 'group'> {}

interface SortableGroupProps {
    className?: string;
    index: number;
    group: Group;
    onDragStart?: (variant: string) => void;
    onDragStop?: () => void;
    onDrag?: (current: HTMLDivElement) => void;
}

export function SortableGroup({
    className,
    index,
    group: { group },
    onDragStart,
    onDragStop,
    onDrag,
}: SortableGroupProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActiveGroup] = useActiveRow<ActiveGroup>();
    const isActive = active?.group === group;
    const setActive = useCallback(() => setActiveGroup({ group, ref }), [group, setActiveGroup]);
    const setInactive = useCallback(() => setActiveGroup(undefined), [setActiveGroup]);
    const setPinned = useCallback(
        (pinned: boolean) => setActiveGroup(active && { ...active, pinned }),
        [active, setActiveGroup]
    );
    const onPin = useCallback(() => setPinned(true), [setPinned]);
    const onUnpin = useCallback((hide = false) => (hide ? setInactive() : setPinned(false)), [setInactive, setPinned]);

    const handleDragStart = useCallback(() => {
        if (!isActive) {
            setActive();
        }
        onDragStart?.(group);
    }, [isActive, onDragStart, setActive, group]);

    const handleDrag = useCallback(() => onDrag?.(ref.current!), [onDrag]);

    return (
        <SortableRow
            ref={ref}
            index={index}
            className={className}
            handle={<DragHandle onPointerDown={setInactive} />}
            controls={isActive ? <GroupControls group={group} onPin={onPin} onUnpin={onUnpin} /> : undefined}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={onDragStop}
        >
            <Cell key="name" className={cx('Name')}>
                {group}
            </Cell>
        </SortableRow>
    );
}
