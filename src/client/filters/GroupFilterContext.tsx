import React, { createContext, use, useState } from 'react';

import { noop } from 'lodash';

export const GroupFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function GroupFilterWrapper({
    initialState = '',
    children,
}: React.PropsWithChildren<{ initialState?: string }>) {
    return <GroupFilterContext value={useState(initialState)}>{children}</GroupFilterContext>;
}

export function useGroupFilter() {
    return use(GroupFilterContext);
}
