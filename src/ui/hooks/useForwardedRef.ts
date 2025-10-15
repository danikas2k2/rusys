import { useEffect, useRef, type ForwardedRef, type RefObject } from 'react';

export function useForwardedRef<T extends Element>(
    forwardedRef: ForwardedRef<T> | undefined,
    initialValue: T | null = null
): RefObject<T | null> {
    const localRef = useRef<T>(initialValue);
    useEffect(() => {
        if (forwardedRef) {
            const current = localRef.current;
            if (typeof forwardedRef === 'function') {
                forwardedRef(current);
            } else {
                // TODO rewrite to avoid mutation
                // eslint-disable-next-line react-hooks/immutability
                forwardedRef.current = current;
            }
        }
    }, [forwardedRef]);
    return localRef;
}
