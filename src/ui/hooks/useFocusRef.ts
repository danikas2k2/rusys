import { useCallback, type ForwardedRef, type RefObject } from 'react';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';

export interface FocusRefObject<T> extends RefObject<T> {
    focus: () => void;
}

export function useFocusRef<T extends HTMLElement>(forwardedRef?: ForwardedRef<T>): FocusRefObject<T> | undefined {
    const ref = useForwardedRef(forwardedRef);
    const focus = useCallback(() => {
        ref?.current?.focus();
    }, [ref]);
    if (ref) {
        (ref as FocusRefObject<T>).focus = focus;
    }
    return ref as FocusRefObject<T>;
}
