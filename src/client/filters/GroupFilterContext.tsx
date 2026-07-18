import { noop } from 'lodash';
import React, { createContext, use, useState } from 'react';

export const GroupFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function GroupFilterWrapper({
    initialState = '',
    children,
}: React.PropsWithChildren<{ initialState?: string }>) {
    return <GroupFilterContext value={useState(initialState)}>{children}</GroupFilterContext>;
}

export const useGroupFilter = () => use(GroupFilterContext);
