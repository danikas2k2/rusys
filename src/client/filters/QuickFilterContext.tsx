import { noop } from 'lodash';
import React, { createContext, use, useState } from 'react';

export const QuickFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function QuickFilterWrapper({
    initialState = '',
    children,
}: React.PropsWithChildren<{ initialState?: string }>) {
    return <QuickFilterContext value={useState(initialState)}>{children}</QuickFilterContext>;
}

export function useQuickFilter() {
    return use(QuickFilterContext);
}
