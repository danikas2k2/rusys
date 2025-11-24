import React, { createContext, use, useState } from 'react';

import { noop } from 'lodash';

export type ActiveContentData = object;

export type ActiveContentAction = 'update' | 'remove' | 'values' | 'export' | 'import';

export interface ActiveContent<D = ActiveContentData, A = ActiveContentAction> {
    id?: string;
    ref?: React.RefObject<HTMLDivElement | null>;
    offset?: number;
    action?: A; // skirtas dialogams ar kitoms interaktyvioms operacijoms
    data?: D;

    // swipe aktyvus, kai data && offset > 0 && !action
    // swipe rodomas, kai data && ref && offset && !action
    // swipe table row visible kai id && !action
    // visi paneliai uzdaromi, kai prev.data && (!data || action)
    // outside click aktyvus kai data && offset && !action
}

export const ActiveContentContext = createContext<[ActiveContent | undefined, (v?: ActiveContent) => void]>([
    undefined,
    noop,
]);

export function ActiveContentWrapper({ children }: React.PropsWithChildren): React.ReactElement {
    return (
        <ActiveContentContext value={useState<ActiveContent | undefined>(undefined)}>{children}</ActiveContentContext>
    );
}

export const useActiveContent = <D = ActiveContentData, T extends ActiveContent<D> = ActiveContent<D>>(): [
    T | undefined,
    (v?: T) => void,
] => use(ActiveContentContext) as [T | undefined, (v?: T) => void];
