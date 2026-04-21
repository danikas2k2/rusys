import { Group, Portal } from '@mantine/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useActiveContent, type ActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipePanelWidth } from '~/client/common/SwipeControlsContext';

import './SwipePanel.pcss';

interface SwipePanelState {
    id?: string;
    rect: DOMRect;
    offset: number;
    closing?: boolean;
}

export function SwipePanel<D = object>({ children }: React.PropsWithChildren): React.ReactElement {
    const [active] = useActiveContent<D>();
    const [panels, setPanels] = useState<SwipePanelState[]>([]);
    const prevActiveRef = useRef<ActiveContent<D> | undefined>(undefined);
    const [, setControlsWidth] = useSwipePanelWidth();
    const controlsRef = useRef<HTMLDivElement>(null);

    // Measure controls width from the first rendered panel
    useEffect(() => {
        const width = controlsRef.current?.offsetWidth;
        if (width) {
            setControlsWidth(width);
        }
    }, [panels, setControlsWidth]);

    const closeAllPanels = useCallback(() => {
        setPanels((prev) => prev.map((p) => ({ ...p, closing: true, offset: 0 })));
    }, []);

    useEffect(() => {
        const prevActive = prevActiveRef.current;
        prevActiveRef.current = active;

        /* eslint-disable react-hooks/set-state-in-effect -- panel layout must follow active row in the same frame */
        if (prevActive?.id && (!active || active.action || prevActive.id !== active.id)) {
            closeAllPanels();
        }

        if (!active?.action && active?.offset !== undefined) {
            const rect = active.ref?.current?.getBoundingClientRect();
            if (!rect) {
                return;
            }

            const offset = active.offset!;
            setPanels((prev) => {
                const panel = { id: active.id, rect, offset };
                const found = prev.findIndex((p) => p.id === active.id);
                return found < 0 ? [...prev, panel] : [...prev.slice(0, found), panel, ...prev.slice(found + 1)];
            });
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [active, closeAllPanels]);

    const handleTransitionEnd = useCallback(
        (panelId: string | undefined) => (e: React.TransitionEvent) => {
            if (e.propertyName === 'transform') {
                setPanels((prev) => prev.filter((p) => p.id !== panelId));
            }
        },
        []
    );

    return (
        <Portal>
            {panels.map((panel, index) => (
                <Group
                    key={panel.id}
                    ref={index === 0 ? controlsRef : undefined}
                    role="group"
                    style={{
                        top: panel.rect.top + 1,
                        height: panel.rect.height - 2,
                        transform: `translateX(${panel.offset}px)`,
                    }}
                    data-swipe-controls
                    {...(panel.closing
                        ? {
                              ['data-closing']: true,
                              onTransitionEnd: handleTransitionEnd(panel.id),
                          }
                        : {})}
                >
                    {children}
                </Group>
            ))}
        </Portal>
    );
}
