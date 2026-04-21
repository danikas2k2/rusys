import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';

export function useReorderHandler<T, P = Partial<T>>({
    items,
    onReorder,
    equals = (a, b) => a === b,
    resolve = (_id) => ({}) as P,
}: {
    items: readonly T[];
    onReorder: (items: T[], active: P) => Promise<void>;
    equals: (a: P, b: P) => boolean;
    resolve: (id: UniqueIdentifier) => P;
}): {
    items: readonly T[];
    reordering: boolean;
    onDragEnd: (e: DragEndEvent) => Promise<void>;
} {
    const [reordering, setReordering] = useState(false);
    const [frozenItems, setFrozenItems] = useState<readonly T[] | null>(null);

    // Freeze items during reordering to prevent jumping
    const displayItems = frozenItems ?? items;
    const findIndex = useCallback(
        (a: P) => displayItems.findIndex((b) => equals(a, b as unknown as P)),
        [displayItems, equals]
    );

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

            setFrozenItems(reorderedItems);

            flushSync(() => setReordering(true));

            try {
                await onReorder(reorderedItems, activeItem);
            } finally {
                setReordering(false);
                setFrozenItems(null);
            }
        },
        [displayItems, findIndex, resolve, onReorder]
    );

    return { items: displayItems, reordering, onDragEnd };
}
