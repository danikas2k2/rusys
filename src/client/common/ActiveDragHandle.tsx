import React, { type PointerEventHandler, useCallback } from 'react';
import { useActiveRow } from '~/client/common/ActiveRowContext';
import { DragHandle, type DragHandleProps } from '~/client/common/DragHandle';
import type { ActiveGroup } from '~/client/groups/SortableGroup';

export function ActiveDragHandle({ dragging, onPointerDown, ...props }: DragHandleProps) {
    const [, setActiveGroup] = useActiveRow<ActiveGroup>();
    const handlePointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            setActiveGroup(undefined);
            onPointerDown?.(e);
        },
        [onPointerDown, setActiveGroup]
    );

    return <DragHandle dragging={dragging} onPointerDown={handlePointerDown} {...props} />;
}
