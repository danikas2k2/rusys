import { useEffect, type ForwardedRef } from 'react';
import { useFocusRef, type FocusRefObject } from '@ui/hooks/useFocusRef';

export function useAutoFocus<T extends HTMLElement>(forwardedRef?: ForwardedRef<T>): FocusRefObject<T> | undefined {
    const ref = useFocusRef(forwardedRef);
    useEffect(() => ref.focus(), [ref]);
    return ref;
}
