import React, { createContext, use, useState, type JSX, type PropsWithChildren, type RefObject } from 'react';

import { noop } from 'lodash';

export type ActiveContentData = object;

export interface ActiveContent<D = ActiveContentData> {
    id: string;
    ref?: RefObject<HTMLDivElement | null>;
    pinned?: boolean;
    editing?: boolean;
    offset?: number;
    data?: D;
}

export const ActiveContentContext = createContext<[ActiveContent | undefined, (v: ActiveContent | undefined) => void]>([
    undefined,
    noop,
]);

export function ActiveContentWrapper({ children }: PropsWithChildren): JSX.Element {
    return (
        <ActiveContentContext value={useState<ActiveContent | undefined>(undefined)}>{children}</ActiveContentContext>
    );
}

export const useActiveContent = <D = ActiveContentData, T extends ActiveContent<D> = ActiveContent<D>>(): [
    T | undefined,
    (v: T | undefined) => void,
] => use(ActiveContentContext) as [T | undefined, (v: T | undefined) => void];
