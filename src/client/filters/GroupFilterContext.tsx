import { noop } from 'lodash';
import React, { createContext, use } from 'react';

import { useSearchParamState } from '~/client/filters/hooks/useSearchParamState';

export const GroupFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function GroupFilterWrapper({
    paramName = 'g',
    initialState = '',
    children,
}: React.PropsWithChildren<{ paramName?: string; initialState?: string }>) {
    return (
        <GroupFilterContext value={useSearchParamState(paramName, initialState)}>
            {children}
        </GroupFilterContext>
    );
}

export function useGroupFilter() {
    return use(GroupFilterContext);
}
