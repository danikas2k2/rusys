import { type TouchEvent, useCallback, useRef } from 'react';

export default function useLongTouch<T>(
    handler: (e: TouchEvent<T>) => void,
    duration = 300
): {
    onTouchStart: (e: TouchEvent<T>) => void;
    onTouchEnd: (e: TouchEvent<T>) => void;
    onDoubleClick: (e: TouchEvent<T>) => void;
} {
    const timerRef = useRef<NodeJS.Timeout>();
    const handledRef = useRef(false);

    const cancelLongPress = (): void => {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
    };

    const onTouchStart = useCallback(
        (e: TouchEvent<T>) => {
            cancelLongPress();
            handledRef.current = false;
            timerRef.current = setTimeout(() => {
                handledRef.current = true;
                handler(e);
                cancelLongPress();
            }, duration);
        },
        [handler, duration]
    );

    const onTouchEnd = useCallback((e: TouchEvent<T>) => {
        if (timerRef.current) {
            cancelLongPress();
        }
        if (handledRef.current) {
            e.preventDefault();
            handledRef.current = false;
        }
    }, []);

    return { onTouchStart, onTouchEnd, onDoubleClick: handler };
}
