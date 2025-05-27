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

export type PressEvent<T = Element> = PointerEvent<T> | TouchEvent<T> | MouseEvent<T>;
export type PressEventHandler<T = Element> = EventHandler<PressEvent<T>>;

type LongPressPointerEvents<T = Element> =
    | {
          onPointerDown?: PointerEventHandler<T>;
          onPointerMove?: PointerEventHandler<T>;
          onPointerUp?: PointerEventHandler<T>;
          onPointerLeave?: PointerEventHandler<T>;
          onPointerCancel?: PointerEventHandler<T>;
      }
    | {
          onTouchStart?: TouchEventHandler<T>;
          onTouchEnd?: TouchEventHandler<T>;
          onTouchMove?: TouchEventHandler<T>;
          onTouchCancel?: TouchEventHandler<T>;
      }
    | {
          onMouseDown?: MouseEventHandler<T>;
          onMouseUp?: MouseEventHandler<T>;
          onMouseMove?: MouseEventHandler<T>;
          onMouseLeave?: MouseEventHandler<T>;
          onMouseOut?: MouseEventHandler<T>;
      };
type LongPressEvents<T = Element> = {
    onClick: (e: MouseEvent<T>) => void;
    onContextMenu: (e: MouseEvent<T>) => void;
} & LongPressPointerEvents<T>;

export function useLongPress<T = Element>(
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
            if (!longPressRef.current && onShortPress) {
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

    const onMove = useCallback((e: MouseEvent<T>) => {
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

    const onClick = useCallback((e: MouseEvent<T>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const onContextMenu = useCallback((e: MouseEvent<T>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return useMemo(() => {
        return {
            ...(window.TouchEvent
                ? {
                      onTouchStart: onStart,
                      onTouchEnd: onEnd,
                      onTouchMove: onMove,
                      onTouchCancel: onCancel,
                  }
                : {}),
            ...(window.PointerEvent
                ? {
                      onPointerDown: onStart,
                      onPointerMove: onMove,
                      onPointerUp: onEnd,
                      onPointerCancel: onCancel,
                      onPointerLeave: onCancel,
                      onPointerOut: onCancel,
                  }
                : {
                      onMouseDown: onStart,
                      onMouseUp: onEnd,
                      onMouseMove: onMove,
                      onMouseLeave: onCancel,
                      onMouseOut: onCancel,
                  }),
            onClick,
            onContextMenu,
        };
    }, [onStart, onEnd, onMove, onCancel, onClick, onContextMenu]);
}

function getX<T>(e: PressEvent<T>): number {
    return ((e as unknown as TouchEvent).touches?.[0] ?? (e as unknown as MouseEvent)).clientX;
}

function getY<T>(e: PressEvent<T>): number {
    return ((e as unknown as TouchEvent).touches?.[0] ?? (e as unknown as MouseEvent)).clientY;
}
