import { noop } from 'lodash';
import React, { createContext, use, useMemo, useState } from 'react';

export type UpdateTypes = 'consumed' | 'updated' | 'recycled';

export const UpdateTypeContext = createContext<[UpdateTypes, (v: UpdateTypes) => void]>(['consumed', noop]);

export function UpdateTypeWrapper({
    initialState = 'consumed',
    children,
}: React.PropsWithChildren<{ initialState?: UpdateTypes }>) {
    const [state, setState] = useState(initialState);
    // useState returns a fresh [state, setState] array every render — memoize it so the
    // context value stays referentially stable and doesn't force every consumer to re-render
    // whenever this wrapper re-renders for an unrelated reason.
    const value = useMemo((): [UpdateTypes, (v: UpdateTypes) => void] => [state, setState], [state]);
    return <UpdateTypeContext value={value}>{children}</UpdateTypeContext>;
}

export const useUpdateType = () => use(UpdateTypeContext);
