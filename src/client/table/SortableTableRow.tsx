import React, { cloneElement } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { type ActiveContentData } from '~/client/common/ActiveContentContext';
import { SwipeableTableRow } from '~/client/table/SwipeableTableRow';
import { TableRowDragHandle } from '~/client/table/TableRowDragHandle';

interface SortableTableRowProps<D = ActiveContentData> {
    readonly id: string;
    readonly data: D;
    readonly disabled?: boolean;
    readonly handle?: React.ReactElement<React.ComponentPropsWithRef<'div'>>;
}

export function SortableTableRow<D = ActiveContentData>({
    id,
    data,
    disabled,
    handle = <TableRowDragHandle />,
    children,
}: React.PropsWithChildren<SortableTableRowProps<D>>): React.JSX.Element {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, setActivatorNodeRef } = useSortable({
        id,
        disabled,
    });

    return (
        <SwipeableTableRow<D>
            id={id}
            data={data}
            style={{
                // TODO move styles to css file using class names
                transform: CSS.Transform.toString(transform),
                transition,
                backgroundColor: isDragging ? 'white' : undefined,
                boxShadow: isDragging ? '0 4px 8px 0 rgba(0, 0, 0, 0.12)' : undefined,
                position: 'relative',
                zIndex: isDragging ? 1 : undefined,
            }}
            ref={setNodeRef}
        >
            {cloneElement(handle, {
                ref: setActivatorNodeRef,
                ...attributes,
                ...listeners,
                ...(disabled ? {} : { style: { cursor: 'grab' } }),
            })}
            {children}
        </SwipeableTableRow>
    );
}
