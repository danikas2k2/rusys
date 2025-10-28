import React, { createContext, use, useState } from 'react';

import { noop } from 'lodash';

export const QuickFilterContext = createContext<[string, (v: string) => void]>(['', noop]);

export function QuickFilterWrapper({
    initialState = '',
    children,
}: React.PropsWithChildren<{ initialState?: string }>) {
    return <QuickFilterContext value={useState(initialState)}>{children}</QuickFilterContext>;
}

export function useQuickFilterContext() {
    return use(QuickFilterContext);
}
