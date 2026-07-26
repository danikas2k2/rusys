import React, { createContext, use, useCallback, useEffect, useMemo, useRef } from 'react';

type RefreshFn = () => Promise<unknown>;

interface RefreshContextValue {
    register: (fn: RefreshFn) => () => void;
    refreshAll: () => Promise<void>;
}

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: React.PropsWithChildren): React.ReactElement {
    const refreshersRef = useRef<Set<RefreshFn>>(new Set());

    const register = useCallback((fn: RefreshFn) => {
        refreshersRef.current.add(fn);
        return () => {
            refreshersRef.current.delete(fn);
        };
    }, []);

    const refreshAll = useCallback(
        async () => void (await Promise.all(Array.from(refreshersRef.current).map((fn) => fn()))),
        []
    );

    const value = useMemo<RefreshContextValue>(() => ({ register, refreshAll }), [register, refreshAll]);

    return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
}

export function useRegisterRefresh(fn: RefreshFn): void {
    const ctx = use(RefreshContext);
    useEffect(() => ctx?.register(fn), [ctx, fn]);
}

export function useRefreshAll(): () => Promise<void> {
    const ctx = use(RefreshContext);
    return ctx?.refreshAll ?? noopRefresh;
}

async function noopRefresh(): Promise<void> {}
