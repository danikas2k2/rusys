import React, { createContext, use, useCallback, useEffect, useMemo, useRef } from 'react';

import type { InitialResource } from '~/components/app/initialData';

type RefreshFn = () => Promise<unknown>;
type ResourceLoader = (initial?: boolean) => Promise<void>;

interface RefreshContextValue {
    register: (fn: RefreshFn) => () => void;
    refreshAll: () => Promise<void>;
    read: (key: string, loader: ResourceLoader) => Promise<void> | null;
    refresh: (key: string, loader: ResourceLoader) => Promise<void>;
    clear: (key: string) => void;
}

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({
    children,
    initialResource,
}: React.PropsWithChildren<{ initialResource?: InitialResource }>): React.ReactElement {
    const refreshersRef = useRef<Set<RefreshFn>>(new Set());
    const resourcesRef = useRef<Map<string, Promise<void> | null>>(
        new Map(initialResource ? [[initialResource, null]] : [])
    );

    const load = useCallback((key: string, loader: ResourceLoader, replace = false): Promise<void> | null => {
        const cached = resourcesRef.current.get(key);
        if (resourcesRef.current.has(key) && !replace) {
            return cached ?? null;
        }

        const promise = Promise.resolve().then(() => loader(!replace));
        resourcesRef.current.set(key, promise);
        return promise;
    }, []);

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

    const read = useCallback((key: string, loader: ResourceLoader) => load(key, loader), [load]);
    const refresh = useCallback((key: string, loader: ResourceLoader) => load(key, loader, true)!, [load]);
    const clear = useCallback((key: string) => resourcesRef.current.delete(key), []);

    const value = useMemo<RefreshContextValue>(
        () => ({ register, refreshAll, read, refresh, clear }),
        [register, refreshAll, read, refresh, clear]
    );

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

export function useSuspenseResource(key: string, loader: ResourceLoader): Promise<void> | null {
    const ctx = use(RefreshContext);
    if (!ctx) {
        throw new Error('Suspense data resources must be rendered inside a RefreshProvider');
    }

    const refresh = useCallback(() => ctx.refresh(key, loader), [ctx, key, loader]);
    useRegisterRefresh(refresh);
    return ctx.read(key, loader);
}

export function useClearSuspenseResource(key: string): () => void {
    const ctx = use(RefreshContext);
    return useCallback(() => ctx?.clear(key), [ctx, key]);
}

async function noopRefresh(): Promise<void> {}
