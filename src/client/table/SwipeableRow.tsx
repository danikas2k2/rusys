import { Table } from '@mantine/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { useSwipePanelDragApi, useSwipePanelWidth } from '~/client/common/SwipeControlsContext';
import { type DraggableRowProps } from '~/client/table/DraggableRow';
import { POINTER_MOVE_THRESHOLD } from '~/client/utils/pointer';
import { dispatchNativeCancelEvents } from '~/client/utils/pointEvents';

interface SwipeableTableRowProps<D = ActiveContentData, T = HTMLTableRowElement> extends DraggableRowProps<D, T> {
    ref?: React.RefCallback<T>;
    avoidSwipeSelectors?: string;
}

const SWIPE_THRESHOLD_PERCENT = 0.2;

export function SwipeableRow<D = ActiveContentData>({
    id,
    data,
    ref,
    avoidSwipeSelectors = '[data-drag-handle]',
    ...props
}: SwipeableTableRowProps<D>): React.ReactElement {
    const [active, setActive] = useActiveContent<D>();
    const activeRef = useRef<HTMLTableRowElement>(null);
    const [controlsWidth] = useSwipePanelWidth();
    const dragApiRef = useSwipePanelDragApi();

    const [x, setX] = useState<number>();

    // Gesture bookkeeping lives in refs, not React state. Native pointer events fire (and
    // must be handled) faster than React can flush state updates, so a handler reading state
    // here could run against a stale closure mid-gesture and re-enter blocks it already
    // passed (e.g. re-triggering the "slide started" setup on every frame). Refs are always
    // current and let the handlers stay referentially stable, so listeners are attached once
    // and never torn down/re-added mid-gesture.
    const slidingRef = useRef(false);
    const draggingRef = useRef(false);
    const movingRef = useRef(false);
    const initialXRef = useRef(0);
    const offsetXRef = useRef(0);
    const offsetYRef = useRef(0);
    // Live offset while a finger is dragging - written straight to the DOM via dragApiRef,
    // bypassing React state so tracking has zero render latency. `x` is only updated once
    // the gesture ends, to drive the settle animation declaratively.
    const dragXRef = useRef(0);
    // True once the panel has had its first imperative write since mounting - that first
    // write is allowed to animate (the "unfold" reveal); every write after tracks 1:1
    const revealedRef = useRef(false);
    // Track initial and last clientX/clientY to calculate deltaX even if sliding never started
    const initialClientXRef = useRef<number | null>(null);
    const lastClientXRef = useRef<number | null>(null);
    const lastClientYRef = useRef<number | null>(null);

    // Latest-value refs so the (stable) pointer handlers below always see current props/state
    // without needing to be recreated - see note on slidingRef et al. above
    const xRef = useRef(x);
    xRef.current = x;
    const latestRef = useRef({ id, data, controlsWidth, avoidSwipeSelectors, setActive });
    latestRef.current = { id, data, controlsWidth, avoidSwipeSelectors, setActive };

    const visible = active?.id === id && !active?.action;

    // Initialize x from active.offset when row becomes visible
    useEffect(() => {
        if (visible && active?.offset !== undefined && x === undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync state from active.offset
            setX(active.offset);
            initialXRef.current = active.offset;
        }
    }, [visible, active?.offset, x]);

    // Update active with transform when x changes
    useEffect(() => {
        if (visible && x !== undefined) {
            const rafId = requestAnimationFrame(() => {
                setActive({ id, data, ref: activeRef, offset: x });
            });
            return () => {
                cancelAnimationFrame(rafId);
            };
        }
    }, [x, visible, setActive, id, data]);

    // Reset offset when row becomes inactive
    useEffect(() => {
        if (!visible && x !== undefined && x !== 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to reset state when row becomes inactive
            setX(undefined);
            initialXRef.current = 0;
        } else if (!visible && x === undefined) {
            initialXRef.current = 0;
        }
    }, [visible, x, id]);

    // Update x when controlsWidth is measured (if x was set to -1 because controlsWidth was 0)
    // Note: setState in effect is necessary here to sync state when controlsWidth becomes available
    useEffect(() => {
        if (visible && x === -1 && controlsWidth > 0) {
            const OPEN_POSITION = -Math.round(controlsWidth);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync state when controlsWidth becomes available
            setX(OPEN_POSITION);
            setActive({ id, data, ref: activeRef, offset: OPEN_POSITION });
        }
    }, [visible, x, controlsWidth, setActive, id, data]);

    const handlePointerDown = useCallback((e: PointerEvent) => {
        if (!e.isPrimary || (e.target as HTMLElement).closest(latestRef.current.avoidSwipeSelectors)) {
            return;
        }

        const { clientX, clientY } = e;
        const currentTarget = e.currentTarget as HTMLTableRowElement;
        const left = currentTarget?.getBoundingClientRect().left;
        if (!draggingRef.current) {
            const initialXValue = xRef.current ?? 0;
            offsetXRef.current = clientX - left - (xRef.current ?? 0);
            offsetYRef.current = clientY;
            initialXRef.current = initialXValue;
            dragXRef.current = initialXValue;
            draggingRef.current = true;
            // Already open (adjusting further) needs no reveal - it's already visible.
            // Starting from closed does, once the panel below actually mounts.
            revealedRef.current = initialXValue !== 0;
            initialClientXRef.current = clientX;
            lastClientXRef.current = clientX;
            lastClientYRef.current = clientY;

            // Keep receiving move/up events for this pointer even if the finger drifts
            // outside the row's bounds mid-gesture (common on a fast swipe) - without this,
            // a stray pointerleave would end the drag early, snapping to a premature position
            try {
                currentTarget?.setPointerCapture?.(e.pointerId);
            } catch {
                // Not supported in every environment - safe to ignore
            }
        }
    }, []);

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!e.isPrimary || !draggingRef.current) {
                return;
            }

            const { clientX, clientY } = e;
            const dy = clientY - offsetYRef.current;
            let dx = clientX - offsetXRef.current;
            // Update last clientX/clientY for handlePointerUp
            lastClientXRef.current = clientX;
            lastClientYRef.current = clientY;

            const ax = Math.abs(dx);
            const ay = Math.abs(dy);
            const justStarted = !movingRef.current;
            if (justStarted) {
                if (ax < POINTER_MOVE_THRESHOLD || ax <= ay) {
                    return;
                }

                movingRef.current = true;
                slidingRef.current = true;
            }

            const { id, data, controlsWidth, setActive } = latestRef.current;
            if (controlsWidth > 0 && -dx > controlsWidth) {
                dx = -controlsWidth;
            } else if (dx > 0) {
                dx = 0;
            }

            dragXRef.current = dx;

            if (justStarted) {
                if (revealedRef.current) {
                    // Already open, just adjusting further - the DOM node exists already,
                    // so keep tracking the finger immediately, no reveal needed
                    dragApiRef.current.setOffset(id, dx, true);
                } else {
                    // Starting from fully closed: mount the panel hidden. Once the node
                    // exists, the next successful write below animates it into view instead
                    // of it appearing there instantly
                    setActive({ id, data, ref: activeRef, offset: 0, instant: true });
                }

                // Cancel any active longpress timers when swipe starts
                if (e.target !== e.currentTarget) {
                    dispatchNativeCancelEvents(e.target);
                }
            } else if (!revealedRef.current) {
                // First write since the panel mounted hidden: let the CSS transition
                // animate the reveal (quick, but visible) instead of snapping instantly
                if (dragApiRef.current.setOffset(id, dx, false)) {
                    revealedRef.current = true;
                }
            } else {
                // Every write after: track the finger 1:1, no easing, no render in the loop
                dragApiRef.current.setOffset(id, dx, true);
            }

            e.preventDefault();
            e.stopPropagation();
        },
        [dragApiRef]
    );

    const handlePointerUp = useCallback(
        (e: PointerEvent) => {
            if (!e.isPrimary) {
                return;
            }

            // pointerup event may not have clientX/clientY if pointer left the element
            // Use lastClientXRef as fallback if clientX are invalid
            // Note: e.clientX can be 0 (invalid), undefined (missing), or a valid number
            const rawClientX = e.clientX;
            // Use rawClientX if it's valid (not undefined, not 0), otherwise use lastClientXRef as fallback
            const clientX = rawClientX !== undefined && rawClientX !== 0 ? rawClientX : undefined;

            // Only end drag if we're actually dragging (don't end if swipe never started)
            if (!draggingRef.current) {
                return;
            }

            try {
                (e.currentTarget as HTMLTableRowElement)?.releasePointerCapture?.(e.pointerId);
            } catch {
                // Not supported in every environment - safe to ignore
            }

            // Calculate deltaX from initial to end position (not from x - initialX, as x is intermediate)
            // Always use clientX coordinates to get the actual swipe distance
            // Note: initialClientXRef.current is always set in pointerDown, so we don't need to check for null
            let deltaX: number;
            if (clientX !== undefined && clientX !== 0) {
                // Use clientX if it's valid (not 0, which indicates invalid event)
                deltaX = clientX - initialClientXRef.current!;
            } else {
                // Fallback to lastClientX if clientX not provided or invalid (0)
                // Note: lastClientXRef is always set in pointerDown and updated in pointerMove,
                // so it's never null when dragging is true. We use non-null assertion for TypeScript.
                deltaX = lastClientXRef.current! - initialClientXRef.current!;
            }

            const { id, data, controlsWidth, setActive } = latestRef.current;
            const initialX = initialXRef.current;
            const openPosition = controlsWidth > 0 ? -Math.round(controlsWidth) : 0;
            const swipeThreshold =
                controlsWidth > 0 ? Math.abs(openPosition) * SWIPE_THRESHOLD_PERCENT : POINTER_MOVE_THRESHOLD;

            if (slidingRef.current) {
                let targetX: number;
                if (!initialX) {
                    // Starting from closed - decide open or stay closed
                    // If swiped more than 20% of controlsWidth, open fully, otherwise close
                    const shouldOpen = Math.abs(deltaX) >= swipeThreshold;
                    targetX = shouldOpen && controlsWidth > 0 ? openPosition : 0;
                } else {
                    const shouldClose = deltaX >= swipeThreshold;
                    targetX = shouldClose ? 0 : openPosition;
                }

                targetX = Math.round(targetX);

                // Push the settle position and re-enable the CSS transition right away, so
                // the snap-open/snap-closed animation starts the instant the finger lifts
                // instead of waiting for React's render to catch up
                dragApiRef.current.setOffset(id, targetX, false);

                if (!targetX) {
                    setX(undefined);
                    setActive();
                } else {
                    setX(targetX);
                    setActive({ id, data, ref: activeRef, offset: targetX });
                }
            } else if (deltaX) {
                if (!initialX && Math.abs(deltaX) >= POINTER_MOVE_THRESHOLD) {
                    // User swiped enough to start (POINTER_MOVE_THRESHOLD), but sliding never started
                    // Use 20% threshold to decide if should open fully
                    const swipedAmount = Math.abs(deltaX);
                    const shouldOpen = swipedAmount >= swipeThreshold;

                    if (shouldOpen && controlsWidth > 0) {
                        setX(openPosition);
                        setActive({ id, data, ref: activeRef, offset: openPosition });
                    }
                }
            }

            draggingRef.current = false;
            slidingRef.current = false;
            movingRef.current = false;
            initialClientXRef.current = null;
            lastClientXRef.current = null;
            lastClientYRef.current = null;
        },
        [dragApiRef]
    );

    // Update touch-action based on panel state
    useEffect(() => {
        const table = activeRef.current?.closest('table');
        if (!table) {
            return;
        }

        // Set touch-action based on panel state (none when open, pan-y when closed)
        table.style.touchAction = visible && x ? 'none' : 'pan-y';

        return () => {
            table.style.touchAction = '';
        };
    }, [visible, x]);

    useEffect(() => {
        const el = activeRef.current;
        if (!el) {
            return;
        }

        el.addEventListener('pointerdown', handlePointerDown, { passive: false });
        el.addEventListener('pointermove', handlePointerMove, { passive: false });
        el.addEventListener('pointerup', handlePointerUp, { passive: false });
        el.addEventListener('pointercancel', handlePointerUp, { passive: false });
        el.addEventListener('pointerleave', handlePointerUp, { passive: false });

        return () => {
            el.removeEventListener('pointerdown', handlePointerDown);
            el.removeEventListener('pointermove', handlePointerMove);
            el.removeEventListener('pointerup', handlePointerUp);
            el.removeEventListener('pointercancel', handlePointerUp);
            el.removeEventListener('pointerleave', handlePointerUp);
        };
    }, [handlePointerDown, handlePointerMove, handlePointerUp]);

    // Combine refs
    const combinedRef = useCallback(
        (node: HTMLTableRowElement | null) => {
            activeRef.current = node;
            ref?.(node);
        },
        [ref]
    );

    return <Table.Tr ref={combinedRef} data-id={id} {...props} />;
}
