import React, { createContext, type PropsWithChildren, type RefObject, useContext, useState } from 'react';

export interface ActiveRow {
    ref?: RefObject<HTMLDivElement | null>;
    pinned?: boolean;
}

export const ActiveRowContext = createContext<[ActiveRow | undefined, (v: ActiveRow | undefined) => void]>([
    undefined,
    () => void 0,
]);

export function ActiveRowContextWrapper({ children }: PropsWithChildren) {
    return <ActiveRowContext value={useState<ActiveRow | undefined>(undefined)}>{children}</ActiveRowContext>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useActiveRow = <T extends ActiveRow>() =>
    useContext(ActiveRowContext) as [T | undefined, (v: T | undefined) => void];
