import React, { createContext, type PropsWithChildren, useContext, useState } from 'react';

export const RecycledContext = createContext<[boolean, (v: boolean) => void]>([false, () => void 0]);

export function RecycledContextWrapper({
    initialState = false,
    children,
}: PropsWithChildren<{ initialState?: boolean }>) {
    return <RecycledContext.Provider value={useState(initialState)}>{children}</RecycledContext.Provider>;
}

export const useRecycled = () => useContext(RecycledContext);
