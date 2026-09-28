import { noop } from 'lodash';
import React, { createContext, use, useMemo, useState } from 'react';

export const QuickFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function QuickFilterWrapper({
    initialState = '',
    children,
}: React.PropsWithChildren<{ initialState?: string }>) {
    const [state, setState] = useState(initialState);
    // useState returns a fresh [state, setState] array every render — memoize it so the
    // context value stays referentially stable and doesn't force every consumer to re-render
    // whenever this wrapper re-renders for an unrelated reason.
    const value = useMemo((): [string, (v: string) => void] => [state, setState], [state]);
    return <QuickFilterContext value={value}>{children}</QuickFilterContext>;
}

export const useQuickFilter = () => use(QuickFilterContext);
