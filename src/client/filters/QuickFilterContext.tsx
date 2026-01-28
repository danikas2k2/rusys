import { noop } from 'lodash';
import React, { createContext, use } from 'react';

import { useSearchParamState } from '~/client/filters/hooks/useSearchParamState';

export const QuickFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function QuickFilterWrapper({
    paramName = 'q',
    initialState = '',
    children,
}: React.PropsWithChildren<{ paramName?: string; initialState?: string }>) {
    return (
        <QuickFilterContext value={useSearchParamState(paramName, initialState)}>
            {children}
        </QuickFilterContext>
    );
}

export function useQuickFilter() {
    return use(QuickFilterContext);
}
