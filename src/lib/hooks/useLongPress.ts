import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';

import { POINTER_LONG_PRESS_DELAY, POINTER_MOVE_THRESHOLD } from '~/lib/utils/pointer';
import { inBounds } from '~/lib/utils/pointEvents';

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
    onLongPress?: React.PointerEventHandler<T>;
    delay?: number;
}

export function useLongPress<T = HTMLElement>({
    onClick,
    onLongPress,
    delay = POINTER_LONG_PRESS_DELAY,
}: LongPressOptions<T>): LongPressEvents<T> {
    const timerRef = useRef<NodeJS.Timeout>(undefined);
    const longPressRef = useRef(false);
    const xRef = useRef(0);
    const yRef = useRef(0);

    const handleCancel = useCallback(() => {
        clearTimeout(timerRef.current);
        longPressRef.current = false;
    }, []);

    const handleDown = useCallback(
        (e: React.PointerEvent<T>) => {
            longPressRef.current = false;
            xRef.current = e.clientX;
            yRef.current = e.clientY;
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                longPressRef.current = true;
                onLongPress?.(e);
            }, delay);
        },
        [delay, onLongPress]
    );

    const handleUp = useCallback(
        (e: React.PointerEvent<T>) => {
            if (!longPressRef.current && onClick && inBounds(e)) {
                clearTimeout(timerRef.current);
                onClick(e);
                handleCancel();
                if (e.pointerType === 'touch') {
                    const absorb = (ev: MouseEvent) => {
                        ev.stopPropagation();
                        ev.preventDefault();
                    };
                    document.addEventListener('click', absorb, { capture: true, once: true });
                    setTimeout(() => document.removeEventListener('click', absorb, true), 600);
                }
            } else {
                handleCancel();
            }
        },
        [handleCancel, onClick]
    );

    const handleMove = useCallback((e: React.PointerEvent<T>) => {
        const x = Math.abs(xRef.current - e.clientX);
        const y = Math.abs(yRef.current - e.clientY);
        if (x > POINTER_MOVE_THRESHOLD || y > POINTER_MOVE_THRESHOLD) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const handleContextMenu = useCallback((e: React.PointerEvent<T>) => {
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
                      onClick,
                      onContextMenu: handleContextMenu,
                  },
        [handleCancel, handleContextMenu, handleDown, handleMove, handleUp, onClick, onLongPress]
    );
}
