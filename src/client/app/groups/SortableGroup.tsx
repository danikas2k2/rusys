import CalendarClockIcon from '@assets/calendar-clock.svg';

import React, { useCallback, useRef } from 'react';

import { ActiveDragHandle } from '~/client/app/common/ActiveDragHandle';
import { useActiveRow, type ActiveRow } from '~/client/app/common/ActiveRowContext';
import { useErrorWrapper } from '~/client/app/common/hooks/useErrorWrapper';
import { SlideControls } from '~/client/app/common/SlideControls';
import { Cell } from '~/client/app/table/Cell';
import { SortableRow } from '~/client/app/table/SortableRow';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';
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
