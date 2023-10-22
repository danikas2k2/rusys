import useFocusRef, { type FocusRefObject } from '@ui/hooks/useFocusRef';
import { type ForwardedRef, useEffect } from 'react';

export default function useAutoFocus<T extends HTMLElement>(
    forwardedRef?: ForwardedRef<T>
): FocusRefObject<T> | undefined {
    const ref = useFocusRef(forwardedRef);
    useEffect(() => ref?.focus(), [ref]);
    return ref;
}
