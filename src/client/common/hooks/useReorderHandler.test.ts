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

    it('does not reorder when oldIndex is -1', async () => {
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
                resolve: () => ({ id: 999, name: 'Not Found' }) as Item,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, 2)));

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('does not reorder when newIndex is -1', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const onReorder = jest.fn();
        const resolveForId1 = jest.fn(() => items.find((item) => item.id === 1)!);
        const resolveForId2 = jest.fn(() => ({ id: 999, name: 'Not Found' }) as Item);
        const resolve = jest.fn((id: UniqueIdentifier) => {
            if (id === 1) {
                return resolveForId1();
            }
            return resolveForId2();
        });
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, 2)));

        expect(resolve).toHaveBeenCalledWith(1);
        expect(resolve).toHaveBeenCalledWith(2);
        expect(resolveForId1).toHaveBeenCalled();
        expect(resolveForId2).toHaveBeenCalled();
        expect(onReorder).not.toHaveBeenCalled();
    });

    it('uses custom equals function', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const onReorder = jest.fn().mockResolvedValue(undefined);
        const customEquals = jest.fn((a: Item, b: Item) => a.id === b.id);
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: customEquals,
                resolve: (id: UniqueIdentifier) => items.find((item) => item.id === id)!,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, 2)));

        expect(customEquals).toHaveBeenCalledWith(expect.anything(), expect.anything());
        expect(onReorder).toHaveBeenCalledWith(expect.any(Array), expect.any(Object));
    });

    it('uses custom resolve function', async () => {
        const items: Item[] = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const onReorder = jest.fn().mockResolvedValue(undefined);
        const customResolve = jest.fn((id: UniqueIdentifier) => items.find((item) => item.id === id)!);
        const { result } = renderHook(() =>
            useReorderHandler({
                items,
                onReorder,
                equals: (a: Item, b: Item) => a.id === b.id,
                resolve: customResolve,
            })
        );

        await act(async () => await result.current.onDragEnd(createMockEvent(1, 2)));

        expect(customResolve).toHaveBeenCalledWith(expect.anything());
        expect(onReorder).toHaveBeenCalledWith(expect.any(Array), expect.any(Object));
    });
});
