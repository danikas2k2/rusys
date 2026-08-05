import { noop } from 'lodash';
import React, { createContext, use, useMemo, useState } from 'react';

export const MissingOnlyContext = createContext<[boolean, (v: boolean) => void]>([false, noop]);

export function MissingOnlyWrapper({
    initialState = false,
    children,
}: React.PropsWithChildren<{
    initialState?: boolean;
}>) {
    const [state, setState] = useState(initialState);
    // useState returns a fresh [state, setState] array every render — memoize it so the
    // context value stays referentially stable and doesn't force every consumer to re-render
    // whenever this wrapper re-renders for an unrelated reason.
    const value = useMemo((): [boolean, (v: boolean) => void] => [state, setState], [state]);
    return <MissingOnlyContext value={value}>{children}</MissingOnlyContext>;
}

export const useMissingOnly = () => use(MissingOnlyContext);
