import type { ForwardedRef, RefObject } from 'react';
import { useEffect, useRef } from 'react';

export default function useForwardedRef<T extends Element>(
    ref: ForwardedRef<T> | undefined,
    initialValue = null
): RefObject<T> {
    const targetRef = useRef<T>(initialValue);
    const refCurrent = (ref as RefObject<T>)?.current;
    useEffect(() => {
        if (!ref) {
            return;
        }
        if (typeof ref === 'function') {
            ref(targetRef.current);
        } else {
            ref.current = targetRef.current;
        }
    }, [ref, refCurrent]);
    return targetRef;
}
