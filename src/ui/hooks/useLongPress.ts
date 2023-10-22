import { type MouseEvent, type PointerEvent, type TouchEvent, useCallback, useRef } from 'react';

const enum EventType {
    POINTER = 'pointer',
    TOUCH = 'touch',
    MOUSE = 'mouse',
}

function getEventType(type: string): EventType {
    if (type.startsWith(EventType.POINTER)) {
        return EventType.POINTER;
    }
    if (type.startsWith(EventType.TOUCH)) {
        return EventType.TOUCH;
    }
    return EventType.MOUSE;
}

export default function useLongPress<T extends Element>(
    onLongPress: (e: TouchEvent<T> | MouseEvent<T>) => void,
    duration = 400
): {
    onPointerDown?: (e: PointerEvent<T>) => void;
    onPointerMove?: (e: PointerEvent<T>) => void;
    onPointerEnd?: (e: PointerEvent<T>) => void;
    onPointerLeave?: (e: PointerEvent<T>) => void;
    onTouchStart?: (e: TouchEvent<T>) => void;
    onTouchEnd?: (e: TouchEvent<T>) => void;
    onTouchMove?: (e: TouchEvent<T>) => void;
    onMouseDown?: (e: MouseEvent<T>) => void;
    onMouseUp?: (e: MouseEvent<T>) => void;
    onMouseMove?: (e: MouseEvent<T>) => void;
    onMouseLeave?: (e: MouseEvent<T>) => void;
    onContextMenu: (e: MouseEvent<T>) => void;
} {
    const timerRef = useRef<NodeJS.Timeout>();
    const eventRef = useRef<EventType>();

    const onStart = useCallback(
        (e: TouchEvent<T> | MouseEvent<T>) => {
            console.info('onStart', e.type);
            if (!eventRef.current) {
                eventRef.current = getEventType(e.type);
                // handledRef.current = false;
                clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => {
                    // handledRef.current = true;
                    console.info('onLongPress');
                    onLongPress(e);
                }, duration);
            }
        },
        [duration, onLongPress]
    );

    const onEnd = useCallback((e: TouchEvent<T> | MouseEvent<T>) => {
        console.info('onEnd', e.type, eventRef.current);
        if (eventRef.current && e.type.startsWith(eventRef.current)) {
            clearTimeout(timerRef.current);
            eventRef.current = undefined;
        }
    }, []);

    const onMove = useCallback(
        (e: TouchEvent<T> | MouseEvent<T>) => {
            console.info('onMove', e.type);
            if (eventRef.current) {
                onEnd(e);
            } else {
                onStart(e);
            }
        },
        [onEnd, onStart]
    );

    const onContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    if (window.PointerEvent) {
        return {
            onPointerDown: onStart,
            onPointerMove: onMove,
            onPointerEnd: onEnd,
            onPointerLeave: onEnd,
            onContextMenu,
        };
    }

    if (window.TouchEvent) {
        return {
            onTouchStart: onStart,
            onTouchEnd: onEnd,
            onTouchMove: onMove,
            onContextMenu,
        };
    }

    return {
        onMouseDown: onStart,
        onMouseUp: onEnd,
        onMouseMove: onMove,
        onMouseLeave: onEnd,
        onContextMenu,
    };
}
