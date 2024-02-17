import {
    type EventHandler,
    type MouseEvent,
    type MouseEventHandler,
    type PointerEvent,
    type PointerEventHandler,
    type TouchEvent,
    type TouchEventHandler,
    useCallback,
    useMemo,
    useRef,
} from 'react';

export type PressEvent<T = Element> = PointerEvent<T> | TouchEvent<T> | MouseEvent<T>;
export type PressEventHandler<T = Element> = EventHandler<PressEvent<T>>;

type LongPressPointerEvents<T = Element> =
    | {
          onPointerDown?: PointerEventHandler<T>;
          onPointerMove?: PointerEventHandler<T>;
          onPointerUp?: PointerEventHandler<T>;
          onPointerLeave?: PointerEventHandler<T>;
      }
    | {
          onTouchStart?: TouchEventHandler<T>;
          onTouchEnd?: TouchEventHandler<T>;
          onTouchMove?: TouchEventHandler<T>;
      }
    | {
          onMouseDown?: MouseEventHandler<T>;
          onMouseUp?: MouseEventHandler<T>;
          onMouseMove?: MouseEventHandler<T>;
          onMouseLeave?: MouseEventHandler<T>;
      };
type LongPressEvents<T = Element> = {
    onClick: (e: MouseEvent<T>) => void;
    onContextMenu: (e: MouseEvent<T>) => void;
} & LongPressPointerEvents<T>;

export function useLongPress<T = Element>(
    onLongPress: PressEventHandler<T>,
    onShortPress?: PressEventHandler<T>,
    duration = 400,
    shortDelay = 100
): LongPressEvents<T> {
    const timerRef = useRef<NodeJS.Timeout>();
    const longPressRef = useRef(false);
    const shortPressRef = useRef(false);

    const onStart = useCallback(
        (e: PressEvent<T>) => {
            longPressRef.current = false;
            shortPressRef.current = false;
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
                            onShortPress?.(e);
                        }, shortDelay);
                    } else {
                        onShortPress?.(e);
                    }
                }
            }
        },
        [onShortPress, shortDelay]
    );

    const onMove = useCallback(() => {
        clearTimeout(timerRef.current);
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
                  }
                : {}),
            ...(window.PointerEvent
                ? {
                      onPointerDown: onStart,
                      onPointerMove: onMove,
                      onPointerUp: onEnd,
                      onPointerLeave: onMove,
                  }
                : {
                      onMouseDown: onStart,
                      onMouseUp: onEnd,
                      onMouseMove: onMove,
                      onMouseLeave: onMove,
                  }),
            onClick,
            onContextMenu,
        };
    }, [onStart, onEnd, onMove, onClick, onContextMenu]);
}
