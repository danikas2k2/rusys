import React, { createContext, use, useState, type PropsWithChildren } from 'react';

export const MissingOnlyContext = createContext<[boolean, (v: boolean) => void]>([false, () => void 0]);

export function MissingOnlyContextWrapper({
    initialState = false,
    children,
}: PropsWithChildren<{
    initialState?: boolean;
}>) {
    return <MissingOnlyContext value={useState(initialState)}>{children}</MissingOnlyContext>;
}

export const useMissingOnly = () => use(MissingOnlyContext);
