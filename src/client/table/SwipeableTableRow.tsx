import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Table } from '@mantine/core';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { useSwipePanelWidth } from '~/client/common/SwipeControlsContext';
import { POINTER_MOVE_THRESHOLD } from '~/client/utils/pointer';
import { dispatchNativeCancelEvents } from '~/client/utils/pointEvents';

interface SwipeableTableRowProps<D = ActiveContentData> {
    id: string;
    data: Readonly<D>;
    style?: React.CSSProperties;
    ref: (element: HTMLTableRowElement | null) => void;
    'data-group'?: string;
    avoidSwipeSelectors?: string;
}

const SWIPE_THRESHOLD_PERCENT = 0.2;
// Minimum change in dx to trigger state update (prevents jitter from small movements)
const MIN_DX_CHANGE = 1;
// Throttle state updates to max 60fps (16ms between updates)
const UPDATE_THROTTLE_MS = 16;

export function SwipeableTableRow<D = ActiveContentData>({
    id,
    data,
    style,
    ref,
    'data-group': dataGroup,
    avoidSwipeSelectors = '[data-drag-handle]',
    children,
}: React.PropsWithChildren<SwipeableTableRowProps<D>>): React.ReactElement {
    const [active, setActive] = useActiveContent<D>();
    const activeRef = useRef<HTMLTableRowElement>(null);
    const [controlsWidth] = useSwipePanelWidth();

    const [sliding, setSliding] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [moving, setMoving] = useState(false);
    const [x, setX] = useState<number>();
    const [initialX, setInitialX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    // Throttle state updates to prevent jitter
    const lastUpdateTimeRef = useRef<number>(0);
    // Track initial and last clientX/clientY to calculate deltaX even if sliding never started
    const initialClientXRef = useRef<number | null>(null);
    const lastClientXRef = useRef<number | null>(null);
    const lastClientYRef = useRef<number | null>(null);

    const visible = active?.id === id && !active?.action;

    // Initialize x from active.offset when row becomes visible
    useEffect(() => {
        if (visible && active?.offset !== undefined && x === undefined) {
            setX(active.offset);
            setInitialX(active.offset);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [x, visible, setActive, id]);

    // Reset offset when row becomes inactive
    useEffect(() => {
        if (!visible && x !== undefined && x !== 0) {
            setX(undefined);
            setInitialX(0);
        } else if (!visible && x === undefined) {
            setInitialX(0);
        }
    }, [visible, x, id]);

    // Update x when controlsWidth is measured (if x was set to -1 because controlsWidth was 0)
    useEffect(() => {
        if (visible && x === -1 && controlsWidth > 0) {
            const OPEN_POSITION = -Math.round(controlsWidth);
            setX(OPEN_POSITION);
            setActive({ id, data, ref: activeRef, offset: OPEN_POSITION });
        }
    }, [visible, x, controlsWidth, setActive, id, data]);

    const handlePointerDown = useCallback(
        (e: PointerEvent) => {
            if (!e.isPrimary || (e.target as HTMLElement).closest(avoidSwipeSelectors)) return;

            const { clientX, clientY } = e;
            const left = (e.currentTarget as HTMLTableRowElement)?.getBoundingClientRect().left;
            if (!dragging) {
                const initialXValue = x ?? 0;
                const offsetXValue = clientX - left - (x ?? 0);
                setInitialX(initialXValue);
                setOffsetX(offsetXValue);
                setOffsetY(clientY);
                setDragging(true);
                initialClientXRef.current = clientX;
                lastClientXRef.current = clientX;
                lastClientYRef.current = clientY;
            }
        },
        [avoidSwipeSelectors, dragging, x]
    );

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!e.isPrimary) return;

            const { clientX, clientY } = e;
            if (dragging) {
                // Use sliding state directly, not local variable, to ensure we always have the latest value
                const dy: number | undefined = clientY - offsetY;
                let dx: number | undefined = clientX - offsetX;
                // Update last clientX/clientY for handleDragEnd
                // Note: We update lastClientXRef before early returns to ensure it's always set when dragging
                // This ensures that if sliding is true, lastClientXRef is always set, making the 216-220 branch unreachable
                lastClientXRef.current = clientX;
                lastClientYRef.current = clientY;

                const ax = Math.abs(dx);
                const ay = Math.abs(dy);
                if (!moving) {
                    if (ax < POINTER_MOVE_THRESHOLD || ax <= ay) {
                        return;
                    }

                    setSliding(true);
                    setActive({ id, data, ref: activeRef });

                    // Cancel any active longpress timers when swipe starts
                    if (e.target !== e.currentTarget) {
                        dispatchNativeCancelEvents(e.target);
                    }

                    setMoving(true);
                }

                const shouldSlide = sliding || (ax > ay && ax >= POINTER_MOVE_THRESHOLD);
                if (shouldSlide) {
                    if (controlsWidth > 0 && -dx > controlsWidth) {
                        dx = -controlsWidth;
                    } else if (dx > 0) {
                        dx = 0;
                    }

                    // Early return if dx hasn't changed significantly or x is already at dx
                    // This prevents unnecessary processing when at limits or during small movements
                    if (x === dx) {
                        // Still update lastClientX/lastClientY for handleDragEnd, but skip setX
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    // Only update if dx change is significant enough to prevent jitter
                    const dxChange = Math.abs(dx - (x ?? 0));
                    if (dxChange < MIN_DX_CHANGE && x !== undefined) {
                        // Change is too small, skip update but still return true to prevent event propagation
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    // Throttle updates to prevent excessive state changes
                    const now = performance.now();
                    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
                    if (timeSinceLastUpdate < UPDATE_THROTTLE_MS && x !== undefined) {
                        // Too soon since last update, skip but still return true
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    lastUpdateTimeRef.current = now;
                    setX(dx);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },
        [dragging, sliding, offsetY, offsetX, moving, setActive, id, data, controlsWidth, x]
    );

    const handlePointerUp = useCallback(
        (e: PointerEvent) => {
            if (!e.isPrimary) return;

            // pointerup event may not have clientX/clientY if pointer left the element
            // Use lastClientXRef as fallback if clientX are invalid
            // Note: e.clientX can be 0 (invalid), undefined (missing), or a valid number
            const rawClientX = e.clientX;
            // Use rawClientX if it's valid (not undefined, not 0), otherwise use lastClientXRef as fallback
            const clientX = rawClientX !== undefined && rawClientX !== 0 ? rawClientX : undefined;

            // Only end drag if we're actually dragging (don't end if swipe never started)
            if (dragging) {
                // Calculate deltaX from initial to end position (not from x - initialX, as x is intermediate)
                // Always use clientX coordinates to get the actual swipe distance
                // Note: initialClientXRef.current is always set in pointerDown, so we don't need to check for null
                let deltaX: number;
                if (clientX !== undefined && clientX !== 0) {
                    // Use clientX if it's valid (not 0, which indicates invalid event)
                    deltaX = clientX - initialClientXRef.current!;
                } else {
                    // Fallback to lastClientX if clientX not provided or invalid (0)
                    // Note: lastClientXRef is always set in pointerDown (line 108) and updated in pointerMove (line 127),
                    // so it's never null when dragging is true. We use non-null assertion for TypeScript.
                    deltaX = lastClientXRef.current! - initialClientXRef.current!;
                }

                const openPosition = controlsWidth > 0 ? -Math.round(controlsWidth) : 0;
                const swipeThreshold =
                    controlsWidth > 0 ? Math.abs(openPosition) * SWIPE_THRESHOLD_PERCENT : POINTER_MOVE_THRESHOLD;

                if (sliding && x != null) {
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

                    if (!targetX) {
                        setX(undefined);
                        setActive();
                    } else {
                        setX(targetX);
                        if (targetX !== x) {
                            setActive({ id, data, ref: activeRef, offset: targetX });
                        }
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
                setDragging(false);
                setSliding(false);
                setMoving(false);
                initialClientXRef.current = null;
                lastClientXRef.current = null;
                lastClientYRef.current = null;
                lastUpdateTimeRef.current = 0;
            }
        },
        [dragging, sliding, x, initialX, controlsWidth, setActive, id, data]
    );

    // Update touch-action based on panel state
    useEffect(() => {
        const table = activeRef.current?.closest('table');
        if (!table) return;

        // Set touch-action based on panel state (none when open, pan-y when closed)
        table.style.touchAction = visible && x ? 'none' : 'pan-y';

        return () => {
            table.style.touchAction = '';
        };
    }, [visible, x]);

    useEffect(() => {
        const el = activeRef.current;
        if (!el) return;

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
    }, [handlePointerDown, handlePointerMove, handlePointerUp, id, dragging, sliding]);

    // Combine refs
    const combinedRef = useCallback(
        (node: HTMLTableRowElement | null) => {
            activeRef.current = node;
            ref(node);
        },
        [ref]
    );

    return (
        <Table.Tr ref={combinedRef} data-group={dataGroup} style={style}>
            {children}
        </Table.Tr>
    );
}
