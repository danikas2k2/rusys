import React, { createContext, type PropsWithChildren, useContext, useState } from 'react';

export const MissingOnlyContext = createContext<[boolean, (v: boolean) => void]>([false, () => void 0]);

export function MissingOnlyContextWrapper({
    initialState = false,
    children,
}: PropsWithChildren<{
    initialState?: boolean;
}>) {
    return <MissingOnlyContext.Provider value={useState(initialState)}>{children}</MissingOnlyContext.Provider>;
}

export const useMissingOnly = () => useContext(MissingOnlyContext);
