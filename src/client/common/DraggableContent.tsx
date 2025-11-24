import React from 'react';

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function DraggableContent({
    onDragStart,
    onDragEnd,
    children,
}: React.PropsWithChildren<{
    onDragStart?: (event: DragStartEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
}>) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {children}
        </DndContext>
    );
}
