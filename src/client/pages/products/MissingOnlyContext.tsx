import React, { createContext, use, useState } from 'react';

import { noop } from 'lodash';

export const MissingOnlyContext = createContext<[boolean, (v: boolean) => void]>([false, noop]);

export function MissingOnlyWrapper({
    initialState = false,
    children,
}: React.PropsWithChildren<{
    initialState?: boolean;
}>) {
    return <MissingOnlyContext value={useState(initialState)}>{children}</MissingOnlyContext>;
}

export const useMissingOnly = () => use(MissingOnlyContext);
