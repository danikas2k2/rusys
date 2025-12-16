import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { cloneElement } from 'react';

import type { ActiveContentData } from '~/client/common/ActiveContentContext';
import type { DraggableRowProps } from '~/client/table/DraggableRow';
import { DragHandle } from '~/client/table/DragHandle';
import { SwipeableRow } from '~/client/table/SwipeableRow';

interface SortableRowProps<D = ActiveContentData, T = HTMLTableRowElement> extends DraggableRowProps<D, T> {
    disabled?: boolean;
    handle?: React.ReactElement<React.ComponentPropsWithRef<typeof DragHandle>>;
}

export function SortableRow<D = ActiveContentData>({
    id,
    data,
    disabled,
    handle = <DragHandle />,
    children,
    ...props
}: SortableRowProps<D>): React.ReactElement {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting, setActivatorNodeRef } =
        useSortable({
            id,
            disabled,
        });

    return (
        <SwipeableRow<D>
            id={id}
            data={data}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                ...(isDragging && { opacity: 0 }),
            }}
            ref={setNodeRef}
            {...props}
            data-dragging={isDragging}
            data-sorting={isSorting}
        >
            {cloneElement(handle, {
                ref: setActivatorNodeRef,
                ...attributes,
                ...listeners,
                ...(disabled ? {} : { style: { cursor: 'grab' } }),
            })}
            {children}
        </SwipeableRow>
    );
}
