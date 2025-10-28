import { act, renderHook } from '@testing-library/react';

import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';

import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';

describe('useReorderHandler', () => {
    interface Item {
        id: number;
        name: string;
    }

    const createMockEvent = (activeId: number, overId: number | null): DragEndEvent =>
        ({
            active: { id: activeId },
            over: overId ? { id: overId } : null,
        }) as unknown as DragEndEvent;

    it('returns initial items and reordering state', () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder: jest.fn(),
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve: (id: UniqueIdentifier) => items.find((item) => item.id === id)!,
            })
        );

        expect(result.current.items).toStrictEqual(items);
        expect(result.current.reordering).toBe(false);
    });

    it('does not reorder when over is null', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const onReorder = jest.fn();
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve: (id: UniqueIdentifier) => items.find((item) => item.id === id)!,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, null)));

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('does not reorder when active and over are the same', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const onReorder = jest.fn();
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve: (id: UniqueIdentifier) => items.find((item) => item.id === id)!,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, 1)));

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('reorders items from first to last position', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
        ];
        const onReorder = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve: (id: UniqueIdentifier) => items.find((item) => item.id === id)!,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, 3)));

        expect(onReorder).toHaveBeenCalledWith(
            [
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' },
                { id: 1, name: 'Item 1' },
            ],
            { id: 1, name: 'Item 1' }
        );
        expect(result.current.reordering).toBe(false);
    });

    it('reorders items from last to first position', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
        ];
        const onReorder = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve: (id: UniqueIdentifier) => items.find((item) => item.id === id)!,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(3, 1)));

        expect(onReorder).toHaveBeenCalledWith(
            [
                { id: 3, name: 'Item 3' },
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
            ],
            { id: 3, name: 'Item 3' }
        );
        expect(result.current.reordering).toBe(false);
    });

    it('works with string items', async () => {
        const items = ['First', 'Second', 'Third'];
        const onReorder = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: string, b: string) => a === b,
                resolve: (id: UniqueIdentifier) => items.find((item) => item === id)!,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent('First' as any, 'Third' as any)));

        expect(onReorder).toHaveBeenCalledWith(['Second', 'Third', 'First'], 'First');
    });
});
