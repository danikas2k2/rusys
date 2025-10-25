import React, { useCallback, type PointerEventHandler } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DragHandle, type DragHandleProps } from '~/client/common/DragHandle';

export function ActiveDragHandle({ dragging, onPointerDown, ...props }: DragHandleProps) {
    const [, setActive] = useActiveContent();
    const handlePointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            setActive(undefined);
            onPointerDown?.(e);
        },
        [onPointerDown, setActive]
    );

    return <DragHandle dragging={dragging} onPointerDown={handlePointerDown} {...props} />;
}
