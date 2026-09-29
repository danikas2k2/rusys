import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React, { useId, useState } from 'react';

export function DraggableContent({
    onDragStart,
    onDragEnd,
    renderDragOverlay,
    children,
}: React.PropsWithChildren<{
    onDragStart?: (event: DragStartEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    renderDragOverlay?: (activeId: UniqueIdentifier, columnWidths: number[]) => React.ReactNode;
}>) {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [columns, setColumns] = useState<number[]>([]);
    const dndId = useId();
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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id);

        const activeElement = document.querySelector(`[data-id="${event.active.id}"]`);
        if (activeElement) {
            const widths = [...activeElement.querySelectorAll('th, td')].map(
                (cell) => (cell as HTMLElement).getBoundingClientRect().width
            );
            setColumns(widths);
        }

        onDragStart?.(event);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        setColumns([]);
        onDragEnd?.(event);
    };

    return (
        <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {children}
            {activeId && renderDragOverlay && <DragOverlay>{renderDragOverlay(activeId, columns)}</DragOverlay>}
        </DndContext>
    );
}
