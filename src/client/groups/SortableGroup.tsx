import CalendarClockIcon from '@assets/calendar-clock.svg';

import React, { useCallback, useRef } from 'react';

import { ActiveDragHandle } from '~/client/common/ActiveDragHandle';
import { useActiveRow, type ActiveRow } from '~/client/common/ActiveRowContext';
import { useErrorWrapper } from '~/client/common/hooks/useErrorWrapper';
import { SlideControls } from '~/client/common/SlideControls';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';
import { Cell } from '~/client/table/Cell';
import { SortableRow } from '~/client/table/SortableRow';
import { type Group } from '~/types/data';
import cx from './SortableGroup.pcss';

export interface ActiveGroup extends ActiveRow, Pick<Group, 'group' | 'annual'> {}

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
    group: { group, annual = true },
    onDragStart,
    onDragStop,
    onDrag,
}: SortableGroupProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActiveGroup] = useActiveRow<ActiveGroup>();
    const isActive = active?.group === group;

    const handleDragStart = useCallback(() => {
        if (!isActive) {
            setActiveGroup({ group, annual, ref });
        }
        onDragStart?.(group);
    }, [isActive, onDragStart, group, setActiveGroup, annual]);

    const handleDrag = useCallback(() => onDrag?.(ref.current!), [onDrag]);

    const deleteGroup = useDeleteGroup();
    const handleRemove = useErrorWrapper(() => deleteGroup(group));

    return (
        <SortableRow
            ref={ref}
            index={index}
            className={className}
            handle={<ActiveDragHandle />}
            controls={isActive ? <SlideControls onRemove={handleRemove} /> : undefined}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={onDragStop}
        >
            <Cell key="name" className={cx('Name')}>
                {group}
            </Cell>
            <Cell key="annual" className={cx('Annual')}>
                {annual && <CalendarClockIcon />}
            </Cell>
        </SortableRow>
    );
}
