import React, { createContext, type JSX, type PropsWithChildren, type RefObject, use, useState } from 'react';

export interface ActiveRow {
    ref?: RefObject<HTMLDivElement | null>;
    pinned?: boolean;
    editing?: boolean;
}

export const ActiveRowContext = createContext<[ActiveRow | undefined, (v: ActiveRow | undefined) => void]>([
    undefined,
    () => void 0,
]);

export function ActiveRowWrapper({ children }: PropsWithChildren): JSX.Element {
    return <ActiveRowContext value={useState<ActiveRow | undefined>(undefined)}>{children}</ActiveRowContext>;
}

export const useActiveRow = <T extends ActiveRow>(): [T | undefined, (v: T | undefined) => void] =>
    use(ActiveRowContext) as [T | undefined, (v: T | undefined) => void];
