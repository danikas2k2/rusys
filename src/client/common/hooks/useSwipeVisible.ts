import { use, useRef, useSyncExternalStore } from 'react';

import { ActiveContentContext } from '~/client/common/ActiveContentContext';

export function useSwipeVisible(): boolean {
    const store = use(ActiveContentContext);
    const lastRef = useRef(false);

    // Selector over the shared store: only re-renders this component when the derived
    // boolean actually flips, not on every unrelated `active` field change (offset ticking
    // during a drag, a different row's data changing, etc.)
    const getSnapshot = () => {
        const active = store.getSnapshot();
        const visible = !!active?.offset && !active.action;
        if (lastRef.current === visible) {
            return lastRef.current;
        }
        lastRef.current = visible;
        return visible;
    };

    return useSyncExternalStore(store.subscribe, getSnapshot);
}
