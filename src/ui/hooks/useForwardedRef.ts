import { useEffect, useRef, type ForwardedRef, type RefObject } from 'react';

export function useForwardedRef<T extends Element>(
    ref: ForwardedRef<T> | undefined,
    initialValue: T | null = null
): RefObject<T | null> {
    const targetRef = useRef<T>(initialValue);
    const refCurrent = (ref as RefObject<T>)?.current;
    useEffect(() => {
        if (!ref) {
            return;
        }
        if (typeof ref === 'function') {
            ref(targetRef.current);
        } else {
            // eslint-disable-next-line react-hooks/immutability
            ref.current = targetRef.current;
        }
    }, [ref, refCurrent]);
    return targetRef;
}
