import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';

import { POINTER_LONG_PRESS_DELAY, POINTER_MOVE_THRESHOLD, POINTER_SHORT_PRESS_DELAY } from '~/client/utils/pointer';
import { inBounds } from '~/client/utils/pointEvents';

export type LongPressEvents<T = HTMLElement> =
    | {
          onPointerDown?: React.PointerEventHandler<T>;
          onPointerMove?: React.PointerEventHandler<T>;
          onPointerUp?: React.PointerEventHandler<T>;
          onPointerLeave?: React.PointerEventHandler<T>;
          onPointerOut?: React.PointerEventHandler<T>;
          onPointerCancel?: React.PointerEventHandler<T>;
          onContextMenu: React.MouseEventHandler<T>;
      }
    | {
          onClick: React.MouseEventHandler<T>;
          onContextMenu: React.MouseEventHandler<T>;
      };

export function useLongPress<T = HTMLElement>(
    onLongPress?: React.PointerEventHandler<T>,
    onShortPress?: React.PointerEventHandler<T>,
    duration = POINTER_LONG_PRESS_DELAY,
    shortDelay = POINTER_SHORT_PRESS_DELAY
): LongPressEvents<T> {
    const timerRef = useRef<NodeJS.Timeout>(undefined);
    const longPressRef = useRef(false);
    const shortPressRef = useRef(false);
    const xRef = useRef(0);
    const yRef = useRef(0);

    const handleCancel = useCallback(() => {
        clearTimeout(timerRef.current);
        shortPressRef.current = false;
        longPressRef.current = false;
    }, []);

    const handleDown = useCallback(
        (e: React.PointerEvent<T>) => {
            longPressRef.current = false;
            shortPressRef.current = false;
            xRef.current = e.clientX;
            yRef.current = e.clientY;
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                if (!shortPressRef.current && !longPressRef.current) {
                    longPressRef.current = true;
                    onLongPress?.(e);
                }
            }, duration);
        },
        [duration, onLongPress]
    );

    const handleUp = useCallback(
        (e: React.PointerEvent<T>) => {
            if (!longPressRef.current && onShortPress && inBounds(e)) {
                clearTimeout(timerRef.current);
                if (!shortPressRef.current) {
                    shortPressRef.current = true;
                    if (shortDelay) {
                        setTimeout(() => {
                            onShortPress(e);
                            handleCancel();
                        }, shortDelay);
                    } else {
                        onShortPress(e);
                        handleCancel();
                    }
                }
            } else {
                handleCancel();
            }
        },
        [handleCancel, onShortPress, shortDelay]
    );

    const handleMove = useCallback((e: React.PointerEvent<T>) => {
        const x = Math.abs(xRef.current - e.clientX);
        const y = Math.abs(yRef.current - e.clientY);
        if (x > POINTER_MOVE_THRESHOLD || y > POINTER_MOVE_THRESHOLD) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const handleClick = useCallback(
        (e: React.PointerEvent<T>) => {
            onShortPress?.(e);
        },
        [onShortPress]
    );

    const handleContextMenu = useCallback((e: React.MouseEvent<T>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return useMemo(
        () =>
            onLongPress
                ? {
                      onPointerDown: handleDown,
                      onPointerMove: handleMove,
                      onPointerUp: handleUp,
                      onPointerCancel: handleCancel,
                      onPointerLeave: handleCancel,
                      onPointerOut: handleCancel,
                      onContextMenu: handleContextMenu,
                  }
                : {
                      onClick: handleClick,
                      onContextMenu: handleContextMenu,
                  },
        [handleCancel, handleClick, handleContextMenu, handleDown, handleMove, handleUp, onLongPress]
    );
}
