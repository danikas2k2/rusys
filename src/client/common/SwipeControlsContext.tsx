import React, { createContext, use, useState } from 'react';

import { noop } from 'lodash';

export const SwipeControlsContext = createContext<[number, (width: number) => void]>([0, noop]);

export function SwipeControlsWrapper({ children }: React.PropsWithChildren) {
    return <SwipeControlsContext value={useState<number>(0)}>{children}</SwipeControlsContext>;
}

export const useSwipePanelWidth = (): [number, (width: number) => void] => use(SwipeControlsContext);
