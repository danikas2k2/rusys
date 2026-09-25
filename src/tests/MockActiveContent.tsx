import React from 'react';

import {
    ActiveContentContext,
    type ActiveContent,
    type ActiveContentStore,
} from '~/components/runtime/ActiveContentContext';

export function MockActiveContent<P extends ActiveContent>({
    active,
    setActive = vi.fn(),
    children,
}: React.PropsWithChildren<{
    active?: P;
    setActive?: (newState?: P) => void;
}>): React.ReactElement {
    // A fresh store object every render so consumers (via useSyncExternalStore) always see
    // the latest `active` prop, even though this mock never actually calls its listeners -
    // the state "changes" purely by MockActiveContent itself re-rendering with new props
    const store: ActiveContentStore = {
        getSnapshot: () => active,
        subscribe: () => () => {},
        setActive: setActive as (newState?: ActiveContent) => void,
    };

    return <ActiveContentContext value={store}>{children}</ActiveContentContext>;
}
