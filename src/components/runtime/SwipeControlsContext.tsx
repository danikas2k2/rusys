import { noop } from 'lodash';
import React, { createContext, use, useRef, useState } from 'react';

export const SwipeControlsContext = createContext<[number, (width: number) => void]>([0, noop]);

// Imperative escape hatch: while a finger is dragging, SwipeableRow writes the panel's
// transform directly to the DOM (via SwipePanel's node registry), bypassing React state
// entirely so tracking has zero render latency. React state is only touched once the
// gesture ends, to drive the settle (open/close) transition declaratively.
export interface SwipePanelDragApi {
    // Returns true if the panel's DOM node exists and was updated, false if it hasn't
    // mounted yet (caller should retry on the next frame)
    setOffset: (id: string, offset: number, dragging: boolean) => boolean;
}

const noopDragApi: SwipePanelDragApi = { setOffset: () => false };

export const SwipePanelDragContext = createContext<React.RefObject<SwipePanelDragApi>>({ current: noopDragApi });

export function SwipeControlsWrapper({ children }: React.PropsWithChildren) {
    const dragApiRef = useRef<SwipePanelDragApi>(noopDragApi);

    return (
        <SwipeControlsContext value={useState<number>(0)}>
            <SwipePanelDragContext value={dragApiRef}>{children}</SwipePanelDragContext>
        </SwipeControlsContext>
    );
}

export const useSwipePanelWidth = (): [number, (width: number) => void] => use(SwipeControlsContext);

export const useSwipePanelDragApi = (): React.RefObject<SwipePanelDragApi> => use(SwipePanelDragContext);
