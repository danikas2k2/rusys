import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from '@mantine/core';
import React, { cloneElement } from 'react';

import type { ActiveContentData } from '~/components/runtime/ActiveContentContext';
import type { DraggableRowProps } from '~/components/table/DraggableRow';
import { DragHandle } from '~/components/table/DragHandle';
import { SwipeableRow } from '~/components/table/SwipeableRow';

interface SortableRowProps<D = ActiveContentData, T = HTMLTableRowElement> extends DraggableRowProps<D, T> {
    disabled?: boolean;
    swipeable?: boolean;
    handle?: React.ReactElement<React.ComponentPropsWithRef<typeof DragHandle>>;
}

export function SortableRow<D = ActiveContentData>({
    id,
    data,
    disabled,
    swipeable = true,
    handle = <DragHandle />,
    children,
    ...props
}: SortableRowProps<D>): React.ReactElement {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting, setActivatorNodeRef } =
        useSortable({
            id,
            disabled,
        });

    const rowProps = {
        style: {
            transform: CSS.Transform.toString(transform),
            transition,
            ...(isDragging && { opacity: 0 }),
        },
        ...props,
        'data-dragging': isDragging,
        'data-sorting': isSorting,
    };
    const content = (
        <>
            {cloneElement(handle, {
                ref: setActivatorNodeRef,
                ...attributes,
                ...listeners,
                ...(disabled
                    ? { 'aria-disabled': true, 'data-disabled': true }
                    : { style: { cursor: 'grab' }, 'data-disabled': undefined }),
            })}
            {children}
        </>
    );

    return swipeable ? (
        <SwipeableRow<D> id={id} data={data} ref={setNodeRef} {...rowProps}>
            {content}
        </SwipeableRow>
    ) : (
        <Table.Tr ref={setNodeRef} data-id={id} {...rowProps}>
            {content}
        </Table.Tr>
    );
}
