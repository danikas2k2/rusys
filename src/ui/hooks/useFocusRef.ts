import { useCallback, type ForwardedRef, type RefObject } from 'react';

import { useForwardedRef } from '@ui/hooks/useForwardedRef';

export interface FocusRefObject<T> extends RefObject<T> {
    focus: () => void;
}

export function useFocusRef<T extends HTMLElement>(forwardedRef?: ForwardedRef<T>): FocusRefObject<T> {
    const ref = useForwardedRef(forwardedRef);
    (ref as FocusRefObject<T>).focus = useCallback(() => {
        ref.current?.focus();
    }, [ref]);
    return ref as FocusRefObject<T>;
}
