import {
    useCallback,
    useMemo,
    useRef,
    type EventHandler,
    type MouseEvent,
    type MouseEventHandler,
    type PointerEvent,
    type PointerEventHandler,
    type TouchEvent,
    type TouchEventHandler,
} from 'react';
import { POINTER_LONG_PRESS_DELAY, POINTER_MOVE_THRESHOLD, POINTER_SHORT_PRESS_DELAY } from '@ui/utils/values';

export type PressEvent<T = HTMLElement> = PointerEvent<T> | TouchEvent<T> | MouseEvent<T>;

export type PressEventHandler<T = HTMLElement> = EventHandler<PressEvent<T>>;

export interface PointerEvents<T = HTMLElement> {
    onPointerDown?: PointerEventHandler<T>;
    onPointerMove?: PointerEventHandler<T>;
    onPointerUp?: PointerEventHandler<T>;
    onPointerLeave?: PointerEventHandler<T>;
    onPointerOut?: PointerEventHandler<T>;
    onPointerCancel?: PointerEventHandler<T>;
}

export interface TouchEvents<T = HTMLElement> {
    onTouchStart?: TouchEventHandler<T>;
    onTouchEnd?: TouchEventHandler<T>;
    onTouchMove?: TouchEventHandler<T>;
    onTouchCancel?: TouchEventHandler<T>;
}

export interface MouseEvents<T = HTMLElement> {
    onMouseDown?: MouseEventHandler<T>;
    onMouseUp?: MouseEventHandler<T>;
    onMouseMove?: MouseEventHandler<T>;
    onMouseLeave?: MouseEventHandler<T>;
    onMouseOut?: MouseEventHandler<T>;
}

export type LongPressPointerEvents<T = HTMLElement> = PointerEvents<T> | TouchEvents<T> | MouseEvents<T>;

export type LongPressEvents<T = HTMLElement> = {
    onClick: (e: MouseEvent<T>) => void;
    onContextMenu: (e: MouseEvent<T>) => void;
} & LongPressPointerEvents<T>;

export function useLongPress<T = HTMLElement>(
    onLongPress: PressEventHandler<T>,
    onShortPress?: PressEventHandler<T>,
    duration = POINTER_LONG_PRESS_DELAY,
    shortDelay = POINTER_SHORT_PRESS_DELAY
): LongPressEvents<T> {
    const timerRef = useRef<NodeJS.Timeout>(undefined);
    const longPressRef = useRef(false);
    const shortPressRef = useRef(false);
    const xRef = useRef(0);
    const yRef = useRef(0);

    const onStart = useCallback(
        (e: PressEvent<T>) => {
            longPressRef.current = false;
            shortPressRef.current = false;
            xRef.current = getX(e);
            yRef.current = getY(e);
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                if (!shortPressRef.current && !longPressRef.current) {
                    longPressRef.current = true;
                    onLongPress(e);
                }
            }, duration);
        },
        [duration, onLongPress]
    );

    const onEnd = useCallback(
        (e: PressEvent<T>) => {
            if (!longPressRef.current && onShortPress && inBounds(e)) {
                clearTimeout(timerRef.current);
                if (!shortPressRef.current) {
                    shortPressRef.current = true;
                    if (shortDelay) {
                        setTimeout(() => {
                            onShortPress(e);
                        }, shortDelay);
                    } else {
                        onShortPress(e);
                    }
                }
            }
        },
        [onShortPress, shortDelay]
    );

    const onMove = useCallback((e: PressEvent<T>) => {
        const x = Math.abs(xRef.current - getX(e));
        const y = Math.abs(yRef.current - getY(e));
        if (x > POINTER_MOVE_THRESHOLD || y > POINTER_MOVE_THRESHOLD) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const onCancel = useCallback(() => {
        clearTimeout(timerRef.current);
        shortPressRef.current = true;
    }, []);

    const onClick = useCallback(
        (e: MouseEvent<T>) => {
            e.preventDefault();
            e.stopPropagation();
            onEnd(e);
        },
        [onEnd]
    );

    const onContextMenu = useCallback((e: MouseEvent<T>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return useMemo(() => {
        return {
            ...getEvents(onStart, onMove, onEnd, onCancel),
            onClick,
            onContextMenu,
        };
    }, [onStart, onEnd, onMove, onCancel, onClick, onContextMenu]);
}

function getX<T>(e: PressEvent<T>): number {
    return ((e as unknown as TouchEvent).touches?.[0] ?? (e as unknown as MouseEvent)).clientX ?? 0;
}

function getY<T>(e: PressEvent<T>): number {
    return ((e as unknown as TouchEvent).touches?.[0] ?? (e as unknown as MouseEvent)).clientY ?? 0;
}

function inBounds<T>(e: PressEvent<T>): boolean {
    const rect = (e.currentTarget as unknown as HTMLElement).getBoundingClientRect();
    const x = getX(e);
    const y = getY(e);
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getEvents<T = HTMLElement>(
    onStart: (e: PressEvent<T>) => void,
    onMove: (e: PressEvent<T>) => void,
    onEnd: (e: PressEvent<T>) => void,
    onCancel: () => void
): LongPressPointerEvents<T> {
    if (window.PointerEvent) {
        return {
            onPointerDown: onStart,
            onPointerMove: onMove,
            onPointerUp: onEnd,
            onPointerCancel: onCancel,
            onPointerLeave: onCancel,
            onPointerOut: onCancel,
        };
    }

    if (window.TouchEvent && (window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints)) {
        return {
            onTouchStart: onStart,
            onTouchEnd: onEnd,
            onTouchMove: onMove,
            onTouchCancel: onCancel,
        };
    }

    return {
        onMouseDown: onStart,
        onMouseUp: onEnd,
        onMouseMove: onMove,
        onMouseLeave: onCancel,
        onMouseOut: onCancel,
    };
}
