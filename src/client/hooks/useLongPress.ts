import type React from 'react';
import { useCallback, useRef } from 'react';

import { POINTER_LONG_PRESS_DELAY, POINTER_MOVE_THRESHOLD, POINTER_SHORT_PRESS_DELAY } from '~/client/utils/pointer';
import { inBounds, type PointerEvents } from '~/client/utils/pointEvents';

export interface LongPressEvents<T = HTMLElement> extends PointerEvents<T> {
    onClick: React.MouseEventHandler<T>;
    onContextMenu: React.MouseEventHandler<T>;
}

export function useLongPress<T = HTMLElement>(
    onLongPress: React.PointerEventHandler<T>,
    onShortPress?: React.PointerEventHandler<T>,
    duration = POINTER_LONG_PRESS_DELAY,
    shortDelay = POINTER_SHORT_PRESS_DELAY
): LongPressEvents<T> {
    const timerRef = useRef<NodeJS.Timeout>(undefined);
    const longPressRef = useRef(false);
    const shortPressRef = useRef(false);
    const xRef = useRef(0);
    const yRef = useRef(0);

    const onStart = useCallback(
        (e: React.PointerEvent<T>) => {
            longPressRef.current = false;
            shortPressRef.current = false;
            xRef.current = e.clientX;
            yRef.current = e.clientY;
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
        (e: React.PointerEvent<T>) => {
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

    const onMove = useCallback((e: React.PointerEvent<T>) => {
        const x = Math.abs(xRef.current - e.clientX);
        const y = Math.abs(yRef.current - e.clientY);
        if (x > POINTER_MOVE_THRESHOLD || y > POINTER_MOVE_THRESHOLD) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const onCancel = useCallback(() => {
        clearTimeout(timerRef.current);
        shortPressRef.current = true;
        longPressRef.current = false;
    }, []);

    const onClick = useCallback(
        (e: React.PointerEvent<T>) => {
            e.preventDefault();
            e.stopPropagation();
            onEnd(e);
        },
        [onEnd]
    );

    const onContextMenu = useCallback((e: React.MouseEvent<T>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return {
        onPointerDown: onStart,
        onPointerMove: onMove,
        onPointerUp: onEnd,
        onPointerCancel: onCancel,
        onPointerLeave: onCancel,
        onPointerOut: onCancel,
        onClick,
        onContextMenu,
    };
}
