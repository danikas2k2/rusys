import React, { useCallback, type PointerEventHandler } from 'react';

import { useActiveRow } from '~/client/app/common/ActiveRowContext';
import { DragHandle, type DragHandleProps } from '~/client/app/common/DragHandle';
import { type ActiveGroup } from '~/client/app/groups/SortableGroup';

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
