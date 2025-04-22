import React, { createContext, use, useState, type PropsWithChildren } from 'react';

export const RecycledContext = createContext<[boolean, (v: boolean) => void]>([false, () => void 0]);

export function RecycledContextWrapper({
    initialState = false,
    children,
}: PropsWithChildren<{ initialState?: boolean }>) {
    return <RecycledContext value={useState(initialState)}>{children}</RecycledContext>;
}

export const useRecycled = () => use(RecycledContext);
