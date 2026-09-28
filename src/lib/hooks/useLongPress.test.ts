import { act, renderHook } from '@testing-library/react';

import { useLongPress } from '~/lib/hooks/useLongPress';

function makeEvent(overrides: Partial<{ clientX: number; clientY: number; pointerType: string }> = {}) {
    return {
        clientX: overrides.clientX ?? 5,
        clientY: overrides.clientY ?? 5,
        currentTarget: {
            getBoundingClientRect: () => ({ left: 0, right: 10, top: 0, bottom: 10 }),
        },
        pointerType: overrides.pointerType ?? 'mouse',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
    } as any;
}

describe('useLongPress', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns the click/context-menu shape when onLongPress is not given', () => {
        const onClick = vi.fn();
        const { result } = renderHook(() => useLongPress({ onClick }));

        expect(result.current).toStrictEqual({
            onClick,
            onContextMenu: expect.any(Function),
        });
    });

    it('returns the full pointer handler set when onLongPress is given', () => {
        const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn() }));

        expect(result.current).toMatchObject({
            onPointerDown: expect.any(Function),
            onPointerMove: expect.any(Function),
            onPointerUp: expect.any(Function),
            onPointerCancel: expect.any(Function),
            onPointerLeave: expect.any(Function),
            onPointerOut: expect.any(Function),
            onContextMenu: expect.any(Function),
        });
    });

    it('calls onClick on pointer up within bounds before the long-press delay', () => {
        const onClick = vi.fn();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onClick, onLongPress }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent()));
        act(() => handlers.onPointerUp(makeEvent()));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onLongPress).not.toHaveBeenCalled();
    });

    it('fires onLongPress once the delay elapses without a pointer up', () => {
        vi.useFakeTimers();
        const onClick = vi.fn();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onClick, onLongPress, delay: 400 }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent()));
        act(() => vi.advanceTimersByTime(400));

        expect(onLongPress).toHaveBeenCalledTimes(1);

        act(() => handlers.onPointerUp(makeEvent()));

        // Long press already fired - pointer up must not also fire the click
        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when the pointer is released outside the target bounds', () => {
        const onClick = vi.fn();
        const { result } = renderHook(() => useLongPress({ onClick, onLongPress: vi.fn() }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent()));
        act(() => handlers.onPointerUp(makeEvent({ clientX: 999, clientY: 999 })));

        expect(onClick).not.toHaveBeenCalled();
    });

    it('cancels the pending long-press timer once the pointer moves past the threshold', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress, delay: 400 }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent({ clientX: 5, clientY: 5 })));
        act(() => handlers.onPointerMove(makeEvent({ clientX: 30, clientY: 5 })));
        act(() => vi.advanceTimersByTime(400));

        expect(onLongPress).not.toHaveBeenCalled();
    });

    it('does not cancel the timer for movement within the threshold', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress, delay: 400 }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent({ clientX: 5, clientY: 5 })));
        act(() => handlers.onPointerMove(makeEvent({ clientX: 8, clientY: 5 })));
        act(() => vi.advanceTimersByTime(400));

        expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('adds a click-absorbing listener for a touch pointer up, removed after a timeout', () => {
        vi.useFakeTimers();
        const addSpy = vi.spyOn(document, 'addEventListener');
        const removeSpy = vi.spyOn(document, 'removeEventListener');
        const { result } = renderHook(() => useLongPress({ onClick: vi.fn(), onLongPress: vi.fn() }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent({ pointerType: 'touch' })));
        act(() => handlers.onPointerUp(makeEvent({ pointerType: 'touch' })));

        expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), { capture: true, once: true });

        act(() => vi.advanceTimersByTime(600));

        expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true);

        addSpy.mockRestore();
        removeSpy.mockRestore();
    });

    it('does not add a click-absorbing listener for a non-touch pointer up', () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        const { result } = renderHook(() => useLongPress({ onClick: vi.fn(), onLongPress: vi.fn() }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent({ pointerType: 'mouse' })));
        act(() => handlers.onPointerUp(makeEvent({ pointerType: 'mouse' })));

        expect(addSpy).not.toHaveBeenCalledWith('click', expect.any(Function), expect.anything());

        addSpy.mockRestore();
    });

    it('cancels on pointer cancel/leave/out', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress, delay: 400 }));

        const handlers = result.current as any;

        act(() => handlers.onPointerDown(makeEvent()));
        act(() => handlers.onPointerCancel());
        act(() => vi.advanceTimersByTime(400));

        expect(onLongPress).not.toHaveBeenCalled();
    });

    it('prevents default and stops propagation on context menu', () => {
        const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn() }));
        const handlers = result.current as any;
        const event = makeEvent();

        act(() => handlers.onContextMenu(event));

        expect(event.preventDefault).toHaveBeenCalledWith();
        expect(event.stopPropagation).toHaveBeenCalledWith();
    });
});
