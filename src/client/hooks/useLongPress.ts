import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { POINTER_LONG_PRESS_DELAY, POINTER_MOVE_THRESHOLD, POINTER_SHORT_PRESS_DELAY } from '~/client/utils/pointer';
import {
    getPointEvents,
    getPointX,
    getPointY,
    inBounds,
    type PointEvent,
    type PointEvents,
} from '~/client/utils/pointEvents';

export type PressEvent<T = HTMLElement> = PointEvent<T>;

export type PressEventHandler<T = HTMLElement> = React.EventHandler<PressEvent<T>>;

export type LongPressPointerEvents<T = HTMLElement> = PointEvents<T>;

export type LongPressEvents<T = HTMLElement> = {
    onClick: React.MouseEventHandler<T>;
    onContextMenu: React.MouseEventHandler<T>;
    cancel: () => void;
} & LongPressPointerEvents<T>;

// Custom event name for canceling all longpress timers
const CANCEL_LONGPRESS_EVENT = 'cancel-longpress';

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
            xRef.current = getPointX(e);
            yRef.current = getPointY(e);
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
        const x = Math.abs(xRef.current - getPointX(e));
        const y = Math.abs(yRef.current - getPointY(e));
        if (x > POINTER_MOVE_THRESHOLD || y > POINTER_MOVE_THRESHOLD) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const onCancel = useCallback(() => {
        clearTimeout(timerRef.current);
        shortPressRef.current = true;
        longPressRef.current = false;
    }, []);

    // Listen for global cancel event
    useEffect(() => {
        document.addEventListener(CANCEL_LONGPRESS_EVENT, onCancel);
        return () => {
            document.removeEventListener(CANCEL_LONGPRESS_EVENT, onCancel);
        };
    }, [onCancel]);

    const onClick = useCallback(
        (e: React.MouseEvent<T>) => {
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

    const events = {
        // eslint-disable-next-line react-hooks/refs -- refs are used to keep the same reference for the event handlers
        ...getPointEvents({ onStart, onMove, onEnd, onCancel }),
        onClick,
        onContextMenu,
    };

    // Add cancel function to the events object, but mark it as non-enumerable
    // so it doesn't interfere with spread operator usage
    Object.defineProperty(events, 'cancel', {
        value: onCancel,
        enumerable: false,
        writable: false,
        configurable: false,
    });

    return events as LongPressEvents<T>;
}

/**
 * Cancels all active longpress timers across the application.
 * This is useful when swipe gestures start, to prevent longpress from firing.
 */
export function cancelAllLongPressTimers(): void {
    document.dispatchEvent(new CustomEvent(CANCEL_LONGPRESS_EVENT));
}
