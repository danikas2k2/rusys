import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';

import { POINTER_LONG_PRESS_DELAY, POINTER_MOVE_THRESHOLD } from '~/client/utils/pointer';
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

export interface LongPressOptions<T = HTMLElement> {
    onClick?: React.PointerEventHandler<T>;
    clickDelay?: number;
    onLongPress?: React.PointerEventHandler<T>;
    longPressDelay?: number;
}

export function useLongPress<T = HTMLElement>({
    onClick,
    clickDelay = 0,
    onLongPress,
    longPressDelay = POINTER_LONG_PRESS_DELAY,
}: LongPressOptions<T>): LongPressEvents<T> {
    const timerRef = useRef<NodeJS.Timeout>(undefined);
    const longPressRef = useRef(false);
    const shortPressRef = useRef(false);
    const xRef = useRef(0);
    const yRef = useRef(0);

    const handleCancel = useCallback((e: React.PointerEvent<T>) => {
        console.info(`[useLongPress / cancel]`, e.pointerType, e.type, {
            longPressRef: longPressRef.current,
            shortPressRef: shortPressRef.current,
        });

        clearTimeout(timerRef.current);
        shortPressRef.current = false;
        longPressRef.current = false;
    }, []);

    const handleDown = useCallback(
        (e: React.PointerEvent<T>) => {
            console.info(`[useLongPress / down]`, e.pointerType, e.type, {
                longPressRef: longPressRef.current,
                shortPressRef: shortPressRef.current,
            });

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
            }, longPressDelay);
        },
        [longPressDelay, onLongPress]
    );

    const handleUp = useCallback(
        (e: React.PointerEvent<T>) => {
            console.info(`[useLongPress / up]`, e.pointerType, e.type, {
                longPressRef: longPressRef.current,
                shortPressRef: shortPressRef.current,
            });

            if (!longPressRef.current && onClick && inBounds(e)) {
                clearTimeout(timerRef.current);
                if (!shortPressRef.current) {
                    shortPressRef.current = true;
                    if (clickDelay) {
                        setTimeout(() => {
                            onClick(e);
                            handleCancel(e);
                        }, clickDelay);
                    } else {
                        onClick(e);
                        handleCancel(e);
                    }
                }
            } else {
                handleCancel(e);
            }
        },
        [handleCancel, onClick, clickDelay]
    );

    const handleMove = useCallback((e: React.PointerEvent<T>) => {
        console.info(`[useLongPress / move]`, e.pointerType, e.type, {
            longPressRef: longPressRef.current,
            shortPressRef: shortPressRef.current,
        });

        const x = Math.abs(xRef.current - e.clientX);
        const y = Math.abs(yRef.current - e.clientY);
        if (x > POINTER_MOVE_THRESHOLD || y > POINTER_MOVE_THRESHOLD) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const handleClick = useCallback(
        (e: React.PointerEvent<T>) => {
            console.info(`[useLongPress / click]`, e.pointerType, e.type, {
                longPressRef: longPressRef.current,
                shortPressRef: shortPressRef.current,
            });

            onClick?.(e);
        },
        [onClick]
    );

    const handleContextMenu = useCallback((e: React.PointerEvent<T>) => {
        console.info(`[useLongPress / context]`, e.pointerType, e.type, {
            longPressRef: longPressRef.current,
            shortPressRef: shortPressRef.current,
        });

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
