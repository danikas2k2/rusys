import { noop } from 'lodash';
import React, { createContext, use, useMemo, useState } from 'react';

export const GroupFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function GroupFilterWrapper({
    initialState = '',
    children,
}: React.PropsWithChildren<{ initialState?: string }>) {
    const [state, setState] = useState(initialState);
    // useState returns a fresh [state, setState] array every render — memoize it so the
    // context value stays referentially stable and doesn't force every consumer to re-render
    // whenever this wrapper re-renders for an unrelated reason.
    const value = useMemo((): [string, (v: string) => void] => [state, setState], [state]);
    return <GroupFilterContext value={value}>{children}</GroupFilterContext>;
}

export const useGroupFilter = () => use(GroupFilterContext);
