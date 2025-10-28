import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';

export function useReorderHandler<T, P = Partial<T>>({
    items,
    onReorder,
    equals = (a, b) => a === b,
    resolve = (_id) => ({}) as P,
}: {
    items: T[];
    onReorder: (items: T[], active: P) => Promise<void>;
    equals: (a: P, b: P) => boolean;
    resolve: (id: UniqueIdentifier) => P;
}): {
    items: T[];
    reordering: boolean;
    onDragEnd: (e: DragEndEvent) => Promise<void>;
} {
    const [reordering, setReordering] = useState(false);

    // Freeze items during reordering to prevent jumping
    const frozenItemsRef = useRef(items);
    const displayItems = reordering ? frozenItemsRef.current : items;
    const findIndex = useCallback(
        (a: P) => displayItems.findIndex((b) => equals(a, b as unknown as P)),
        [displayItems, equals]
    );

    // Update frozen variants when not reordering
    if (!reordering) {
        frozenItemsRef.current = items;
    }

    const onDragEnd = useCallback(
        async ({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) {
                return;
            }

            const activeItem = resolve(active.id);
            const oldIndex = findIndex(activeItem);
            const newIndex = findIndex(resolve(over.id));
            if (oldIndex === -1 || newIndex === -1) {
                return;
            }

            const reorderedItems = [...displayItems];
            const [movedItem] = reorderedItems.splice(oldIndex, 1);
            reorderedItems.splice(newIndex, 0, movedItem);
            frozenItemsRef.current = reorderedItems;

            flushSync(() => setReordering(true));

            try {
                await onReorder(reorderedItems, activeItem);
            } finally {
                setReordering(false);
            }
        },
        [displayItems, findIndex, resolve, onReorder]
    );

    return { items: displayItems, reordering, onDragEnd };
}
