import { noop } from 'lodash';
import React, { createContext, use, useCallback, useRef, useState, useSyncExternalStore } from 'react';

export type ActiveContentData = object;

export type ActiveContentAction = 'update' | 'remove' | 'values' | 'history' | 'export' | 'import';

export interface ActiveContent<D = ActiveContentData, A = ActiveContentAction> {
    id?: string;
    ref?: React.RefObject<HTMLDivElement | null>;
    offset?: number;
    // true when a live drag is driving the panel imperatively (see SwipeControlsContext) -
    // tells SwipePanel to skip its own mount-reveal animation, since the drag already owns it
    instant?: boolean;
    action?: A; // skirtas dialogams ar kitoms interaktyvioms operacijoms
    data?: D;

    // swipe aktyvus, kai data && offset > 0 && !action
    // swipe rodomas, kai data && ref && offset && !action
    // swipe table row visible kai id && !action
    // visi paneliai uzdaromi, kai prev.data && (!data || action)
    // outside click aktyvus kai data && offset && !action
}

// External store (not React state) so components can subscribe to just the slice of
// `active` they care about via useSyncExternalStore + a memoized selector - e.g. a table
// row only cares whether IT is the active one, not that some other row's offset changed.
// Plain context+useState would re-render every consumer (every row in the table) on every
// change, which is what made swipe interactions slow to begin with (see useActiveRow below).
export interface ActiveContentStore<D = ActiveContentData> {
    getSnapshot: () => ActiveContent<D> | undefined;
    subscribe: (listener: () => void) => () => void;
    setActive: (v?: ActiveContent<D>) => void;
}

export function createActiveContentStore<D = ActiveContentData>(initial?: ActiveContent<D>): ActiveContentStore<D> {
    let value = initial;
    const listeners = new Set<() => void>();

    return {
        getSnapshot: () => value,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        setActive: (v) => {
            value = v;
            listeners.forEach((listener) => listener());
        },
    };
}

const noopStore: ActiveContentStore = {
    getSnapshot: () => undefined,
    subscribe: () => noop,
    setActive: noop,
};

export const ActiveContentContext = createContext<ActiveContentStore>(noopStore);

export function ActiveContentWrapper({ children }: React.PropsWithChildren): React.ReactElement {
    const [store] = useState(() => createActiveContentStore());

    return <ActiveContentContext value={store}>{children}</ActiveContentContext>;
}

export const useActiveContent = <D = ActiveContentData, T extends ActiveContent<D> = ActiveContent<D>>(): [
    T | undefined,
    (v?: T) => void,
] => {
    const store = use(ActiveContentContext);
    const active = useSyncExternalStore(store.subscribe, store.getSnapshot);
    return [active, store.setActive] as [T | undefined, (v?: T) => void];
};

// Setter-only access - never subscribes, so it never causes a re-render on its own. Use
// this wherever a component only ever calls setActive and doesn't read the current value.
export const useSetActiveContent = <D = ActiveContentData, T extends ActiveContent<D> = ActiveContent<D>>(): ((
    v?: T
) => void) => {
    const store = use(ActiveContentContext);
    return store.setActive as (v?: T) => void;
};

export interface ActiveRowState {
    visible: boolean;
    offset?: number;
    instant?: boolean;
}

const INITIAL_ROW_STATE: ActiveRowState = { visible: false };

// Per-row selector: a component only re-renders when ITS OWN relevant slice changes (is it
// the active row, and if so its offset/instant), not on every unrelated `active` update.
export function useActiveRow<D = ActiveContentData, T extends ActiveContent<D> = ActiveContent<D>>(
    id: string | undefined
): [ActiveRowState, (v?: T) => void] {
    const store = use(ActiveContentContext);
    const lastRef = useRef<ActiveRowState>(INITIAL_ROW_STATE);

    const getSnapshot = useCallback(() => {
        const active = store.getSnapshot();
        const visible = active?.id === id && !active?.action;
        const offset = visible ? active?.offset : undefined;
        const instant = visible ? active?.instant : undefined;

        const last = lastRef.current;
        if (last.visible === visible && last.offset === offset && last.instant === instant) {
            return last;
        }

        const next = { visible, offset, instant };
        lastRef.current = next;
        return next;
    }, [store, id]);

    const state = useSyncExternalStore(store.subscribe, getSnapshot);
    return [state, store.setActive as (v?: T) => void];
}
