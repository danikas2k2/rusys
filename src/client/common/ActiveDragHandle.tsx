import React, { useCallback, type PointerEventHandler } from 'react';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { DragHandle, type DragHandleProps } from '~/client/common/DragHandle';

export function ActiveDragHandle({ dragging, onPointerDown, ...props }: DragHandleProps) {
    const [, setActiveRow] = useActiveRow();
    const handlePointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            setActiveRow(undefined);
            onPointerDown?.(e);
        },
        [onPointerDown, setActiveRow]
    );

    return <DragHandle dragging={dragging} onPointerDown={handlePointerDown} {...props} />;
}
