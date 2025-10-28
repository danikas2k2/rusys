import { useImperativeHandle, useRef, type ForwardedRef, type RefObject } from 'react';

export function useForwardedRef<T extends Element>(
    forwardedRef: ForwardedRef<T> | undefined,
    initialValue: T | null = null
): RefObject<T | null> {
    const localRef = useRef<T>(initialValue);
    useImperativeHandle(forwardedRef, () => localRef.current as T, []);
    return localRef;
}
