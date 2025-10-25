import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useActiveContent, type ActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipePanelWidth } from '~/client/common/SwipeControlsContext';
import cx from './SwipePanel.pcss';

interface SwipePanelState {
    id: string;
    rect: DOMRect;
    offset: number;
    closing?: boolean;
}

export function SwipePanel<D = object>({ children }: React.PropsWithChildren): React.JSX.Element {
    const [active] = useActiveContent<D>();
    const [panels, setPanels] = useState<SwipePanelState[]>([]);
    const prevActiveRef = useRef<ActiveContent<D> | undefined>(undefined);
    const [, setControlsWidth] = useSwipePanelWidth();
    const controlsRef = useRef<HTMLDivElement>(null);

    const closeAllPanels = useCallback(() => {
        setPanels((prev) => {
            const closingPanels = prev.map((p) => ({ ...p, closing: true }));

            // After next frame, animate closing panels to transform: 0
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
        if (active?.data && active?.ref?.current && active?.offset !== undefined) {
            const rect = active.ref.current.getBoundingClientRect();

            setPanels((prev) => {
                const existingPanel = prev.find((p) => p.id === active.id && !p.closing);

                // Update existing panel or create new one
                if (existingPanel) {
                    return prev.map((p) => (p.id === active.id && !p.closing ? { ...p, offset, rect } : p));
                }

                return [
                    ...prev.filter((p) => p.closing),
                    {
                        id: active.id,
                        rect,
                        offset,
                        closing: false,
                    },
                ];
            });
        } else if (prevActive?.data && !active?.data) {
            // Close all panels when active becomes undefined
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

    // Measure controls width when first panel is rendered
    useEffect(() => {
        if (controlsRef.current && panels.length > 0) {
            const width = controlsRef.current.offsetWidth;
            if (width > 0) {
                setControlsWidth(width);
            }
        }
    }, [panels, setControlsWidth]);

    return (
        <>
            {panels.map((panel, index) => (
                <div
                    key={panel.id}
                    ref={index === 0 ? controlsRef : undefined}
                    data-swipe-controls
                    className={cx('SwipePanel', { closing: panel.closing })}
                    style={{
                        top: panel.rect.top,
                        height: panel.rect.height,
                        transform: `translateX(${panel.offset}px)`,
                    }}
                >
                    {children}
                </div>
            ))}
        </>
    );
}
