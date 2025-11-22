import React, { cloneElement } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { ActiveContentData } from '~/client/common/ActiveContentContext';
import { DragHandle } from '~/client/table/DragHandle';
import { SwipeableTableRow } from '~/client/table/SwipeableTableRow';

interface SortableRowProps<D = ActiveContentData> {
    id: string;
    data: Readonly<D>;
    disabled?: boolean;
    handle?: React.ReactElement<React.ComponentPropsWithRef<typeof DragHandle>>;
    'data-group'?: string;
}

export function SortableRow<D = ActiveContentData>({
    id,
    data,
    disabled,
    handle = <DragHandle />,
    'data-group': dataGroup,
    children,
}: React.PropsWithChildren<SortableRowProps<D>>): React.ReactElement {
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
                backgroundColor: isDragging ? 'var(--color-base)' : undefined,
                boxShadow: isDragging ? 'var(--shadow-small)' : undefined,
                position: 'relative',
                zIndex: isDragging ? 1 : undefined,
            }}
            ref={setNodeRef}
            data-group={dataGroup}
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
