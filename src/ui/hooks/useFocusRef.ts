import useForwardedRef from '@ui/hooks/useForwardedRef';
import { type ForwardedRef, type RefObject, useCallback } from 'react';

export interface FocusRefObject<T> extends RefObject<T> {
    focus: () => void;
}

export default function useFocusRef<T extends HTMLElement>(
    forwardedRef?: ForwardedRef<T>
): FocusRefObject<T> | undefined {
    const ref = useForwardedRef(forwardedRef);
    const focus = useCallback(() => {
        ref?.current?.focus();
    }, [ref]);
    if (ref) {
        (ref as FocusRefObject<T>).focus = focus;
    }
    return ref as FocusRefObject<T>;
}
