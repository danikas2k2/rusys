import React, { createContext, use, useState, type PropsWithChildren } from 'react';

import { noop } from 'lodash';

export const QuickFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function QuickFilterContextWrapper({
    initialState = '',
    children,
}: PropsWithChildren<{ initialState?: string }>) {
    return <QuickFilterContext value={useState(initialState)}>{children}</QuickFilterContext>;
}

export function useQuickFilterContext() {
    return use(QuickFilterContext);
}
