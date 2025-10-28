import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Portal } from '@mantine/core';

import { useActiveContent, type ActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipePanelWidth } from '~/client/common/SwipeControlsContext';
import cx from './SwipePanel.pcss';

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
        if (controlsRef.current) {
            const width = controlsRef.current.offsetWidth;
            if (width > 0) {
                setControlsWidth(width);
            }
        }
    }, [panels, setControlsWidth]);

    const closeAllPanels = useCallback(() => {
        setPanels((prev) => {
            if (prev.length === 0) return prev;

            // First, mark panels as closing (keeps current offset for animation start)
            const closingPanels = prev.map((p) => ({ ...p, closing: true }));

            // Animate to offset: 0 in next frame
            requestAnimationFrame(() => {
                setPanels((current) => current.map((p) => (p.closing ? { ...p, offset: 0 } : p)));
            });

            return closingPanels;
        });
    }, []);

    // Update panels when active changes
    useEffect(() => {
        const prevActive = prevActiveRef.current;
        prevActiveRef.current = active;

        // If switching to a different row (group changed), close previous panels immediately
        if (prevActive?.data && active?.data && prevActive.data !== active.data) {
            // This is intentional - we're reacting to active changes
            // eslint-disable-next-line
            closeAllPanels();
        }

        const offset = active?.offset ?? 0;
        // Only render panels when not performing an action
        if (active?.data && active?.ref?.current && active?.offset !== undefined && !active?.action) {
            const rect = active.ref.current.getBoundingClientRect();

            setPanels((prev) => {
                const existingPanel = prev.find((p) => p.id === active.id && !p.closing);

                // Update existing panel or create new one
                if (existingPanel) {
                    return prev.map((p) => (p.id === active.id && !p.closing ? { ...p, offset, rect } : p));
                }

                // Remove any old closing panels with the same id to avoid duplicate keys
                return [
                    ...prev.filter((p) => p.closing && p.id !== active.id),
                    {
                        id: active.id,
                        rect,
                        offset,
                        closing: false,
                    },
                ];
            });
        } else if (prevActive?.data && (!active?.data || active?.action)) {
            // Close all panels when active becomes undefined or when an action is active
            closeAllPanels();
        }
    }, [active, closeAllPanels]);

    // Remove closed panels after animation
    useEffect(() => {
        if (panels.some((p) => p.closing)) {
            const timer = setTimeout(() => {
                setPanels((prev) => prev.filter((p) => !p.closing));
            }, 200); // Match CSS transition duration

            return () => clearTimeout(timer);
        }
    }, [panels]);

    return (
        <Portal>
            {panels.map((panel, index) => (
                <div
                    key={panel.id}
                    ref={index === 0 ? controlsRef : undefined}
                    className={cx('SwipePanel')}
                    role="group"
                    data-swipe-controls
                    data-closing={panel.closing}
                    style={{
                        top: panel.rect.top + 1,
                        height: panel.rect.height - 2,
                        transform: `translateX(${panel.offset}px)`,
                    }}
                >
                    {children}
                </div>
            ))}
        </Portal>
    );
}
