import { Group, Portal } from '@mantine/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useActiveContent, type ActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipePanelDragApi, useSwipePanelWidth } from '~/client/common/SwipeControlsContext';

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
    const dragApiRef = useSwipePanelDragApi();
    const nodesRef = useRef<Map<string, HTMLDivElement>>(new Map());

    // Measure controls width from the first rendered panel
    useEffect(() => {
        const width = controlsRef.current?.offsetWidth;
        if (width) {
            setControlsWidth(width);
        }
    }, [panels, setControlsWidth]);

    // Expose an imperative API that writes the transform straight to the DOM node,
    // so SwipeableRow can track the finger without waiting on React renders
    useEffect(() => {
        const nodes = nodesRef.current;
        dragApiRef.current = {
            setOffset: (id, offset, dragging) => {
                const node = nodes.get(id);
                if (!node) {
                    return false;
                }

                node.style.transform = `translateX(${offset}px)`;
                if (dragging) {
                    node.setAttribute('data-dragging', 'true');
                } else {
                    node.removeAttribute('data-dragging');
                }
                return true;
            },
        };

        return () => {
            dragApiRef.current = { setOffset: () => false };
        };
    }, [dragApiRef]);

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
                const found = prev.findIndex((p) => p.id === active.id);
                if (found < 0) {
                    // Brand new panel. Unless the caller is already driving it imperatively
                    // (a live drag, `instant`), mount it hidden - the effect below then
                    // animates it open, so it always visibly unfolds into place instead of
                    // appearing there instantly
                    const panel = { id: active.id, rect, offset: active.instant ? offset : 0 };
                    return [...prev, panel];
                }
                const panel = { id: active.id, rect, offset };
                return [...prev.slice(0, found), panel, ...prev.slice(found + 1)];
            });
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [active, closeAllPanels]);

    // Reveal a freshly-mounted, non-instant panel: move it from hidden (0) to its real
    // offset on the next frame, so the CSS transition animates the unfold
    useEffect(() => {
        if (active?.action || active?.offset === undefined || active.instant || !active.offset) {
            return;
        }

        const panelId = active.id;
        const targetOffset = active.offset;
        const rafId = requestAnimationFrame(() => {
            setPanels((prev) =>
                prev.map((p) => (p.id === panelId && p.offset === 0 ? { ...p, offset: targetOffset } : p))
            );
        });
        return () => cancelAnimationFrame(rafId);
    }, [active?.id, active?.offset, active?.action, active?.instant]);

    const handleTransitionEnd = useCallback(
        (panelId: string | undefined) => (e: React.TransitionEvent) => {
            if (e.propertyName === 'transform') {
                setPanels((prev) => prev.filter((p) => p.id !== panelId));
            }
        },
        []
    );

    const registerNode = useCallback(
        (panelId: string | undefined, isFirst: boolean) => (node: HTMLDivElement | null) => {
            if (isFirst) {
                controlsRef.current = node;
            }
            if (!panelId) {
                return;
            }
            if (node) {
                nodesRef.current.set(panelId, node);
            } else {
                nodesRef.current.delete(panelId);
            }
        },
        []
    );

    return (
        <Portal>
            {panels.map((panel, index) => (
                <Group
                    key={panel.id}
                    ref={registerNode(panel.id, index === 0)}
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
