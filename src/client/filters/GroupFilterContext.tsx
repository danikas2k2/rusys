import React, { createContext, use, useState, type PropsWithChildren } from 'react';

import { noop } from 'lodash';

export const GroupFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function GroupFilterContextWrapper({
    initialState = '',
    children,
}: PropsWithChildren<{ initialState?: string }>) {
    return <GroupFilterContext value={useState(initialState)}>{children}</GroupFilterContext>;
}

export function useGroupFilterContext() {
    return use(GroupFilterContext);
}
