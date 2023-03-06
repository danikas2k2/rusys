import useForwardedRef from '@ui/hooks/useForwardedRef';
import type { ForwardedRef, RefObject } from 'react';
import { useCallback, useEffect } from 'react';

interface FocusRefObject<T> extends RefObject<T> {
    focus: () => void;
}

export default function useAutoFocus<T extends HTMLElement>(
    forwardedRef?: ForwardedRef<T>
): FocusRefObject<T> | undefined {
    const ref = useForwardedRef(forwardedRef);
    const focus = useCallback(() => {
        ref?.current?.focus();
    }, [ref]);
    if (ref) {
        (ref as FocusRefObject<T>).focus = focus;
    }
    useEffect(() => focus(), [focus]);
    return ref as FocusRefObject<T>;
}
