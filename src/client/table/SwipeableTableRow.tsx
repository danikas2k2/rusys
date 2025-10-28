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
    // Track which event type started the drag to avoid duplicate handling
    const eventTypeRef = useRef<'mouse' | 'touch' | 'pointer' | null>(null);
    // Throttle state updates to prevent jitter
    const lastUpdateTimeRef = useRef<number>(0);
    // Track pointer ID from pointerdown to validate pointerup
    const pointerIdRef = useRef<number | null>(null);
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

    const handleDragStart = useCallback(
        (clientX: number, clientY: number, left = 0) => {
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
        [dragging, x]
    );

    const handleDrag = useCallback(
        (clientX: number, clientY: number, e: Event) => {
            if (dragging) {
                // Use sliding state directly, not local variable, to ensure we always have the latest value
                const dy: number | undefined = clientY - offsetY;
                let dx: number | undefined = clientX - offsetX;
                // Update last clientX/clientY for handleDragEnd
                lastClientXRef.current = clientX;
                lastClientYRef.current = clientY;

                const ax = Math.abs(dx);
                const ay = Math.abs(dy);
                if (!moving) {
                    if (ax < POINTER_MOVE_THRESHOLD || ax <= ay) {
                        return false;
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
                        return true;
                    }

                    // Only update if dx change is significant enough to prevent jitter
                    const dxChange = Math.abs(dx - (x ?? 0));
                    if (dxChange < MIN_DX_CHANGE && x !== undefined) {
                        // Change is too small, skip update but still return true to prevent event propagation
                        return true;
                    }

                    // Throttle updates to prevent excessive state changes
                    const now = performance.now();
                    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
                    if (timeSinceLastUpdate < UPDATE_THROTTLE_MS && x !== undefined) {
                        // Too soon since last update, skip but still return true
                        return true;
                    }

                    lastUpdateTimeRef.current = now;
                    setX(dx);
                    return true;
                }
            }
            return false;
        },
        [dragging, sliding, offsetY, offsetX, moving, setActive, id, data, controlsWidth, x]
    );

    const handleDragEnd = useCallback(
        (endClientX?: number, _endClientY?: number) => {
            if (dragging) {
                // Calculate deltaX from initial to end position (not from x - initialX, as x is intermediate)
                // Always use clientX coordinates to get the actual swipe distance
                let deltaX: number;
                if (endClientX !== undefined && endClientX !== 0 && initialClientXRef.current !== null) {
                    // Use endClientX if it's valid (not 0, which indicates invalid event)
                    deltaX = endClientX - initialClientXRef.current;
                } else if (lastClientXRef.current !== null && initialClientXRef.current !== null) {
                    // Fallback to lastClientX if endClientX not provided or invalid (0)
                    deltaX = lastClientXRef.current - initialClientXRef.current;
                } else if (sliding && x != null) {
                    // Last resort: use x - initialX if we don't have clientX coordinates
                    deltaX = x - initialX;
                } else {
                    deltaX = 0;
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
                eventTypeRef.current = null;
                pointerIdRef.current = null;
                initialClientXRef.current = null;
                lastClientXRef.current = null;
                lastClientYRef.current = null;
                lastUpdateTimeRef.current = 0;
            }
        },
        [dragging, sliding, x, initialX, controlsWidth, setActive, id, data]
    );

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            // Don't interfere with drag handle
            if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
                return;
            }

            // Ignore if touch or pointer event already started
            if (eventTypeRef.current && eventTypeRef.current !== 'mouse') {
                return;
            }

            eventTypeRef.current = 'mouse';
            const { clientX, clientY } = e;
            const left = (e.currentTarget as HTMLTableRowElement)?.getBoundingClientRect()?.left;
            handleDragStart(clientX, clientY, left);
        },
        [handleDragStart]
    );

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            // Don't interfere with drag handle
            if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
                return;
            }

            // Ignore if mouse or pointer event already started
            if (eventTypeRef.current && eventTypeRef.current !== 'touch') {
                return;
            }

            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) {
                return;
            }

            eventTypeRef.current = 'touch';
            const { clientX, clientY } = touch;
            const left = (e.currentTarget as HTMLTableRowElement)?.getBoundingClientRect()?.left;
            handleDragStart(clientX, clientY, left);
        },
        [handleDragStart]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            // Only handle if mouse event started the drag
            if (eventTypeRef.current !== 'mouse') {
                return;
            }

            const { clientX, clientY } = e;
            const handled = handleDrag(clientX, clientY, e);
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [handleDrag]
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            // Only handle if touch event started the drag
            if (eventTypeRef.current !== 'touch') {
                return;
            }

            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) {
                return;
            }

            const { clientX, clientY } = touch;
            const handled = handleDrag(clientX, clientY, e);
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [handleDrag]
    );

    const handleMouseUp = useCallback(
        (e: MouseEvent) => {
            // Only handle if mouse event started the drag
            if (eventTypeRef.current !== 'mouse') {
                return;
            }

            const { clientX, clientY } = e;
            // Only end drag if we're actually dragging (don't end if swipe never started)
            if (dragging) {
                handleDragEnd(clientX, clientY);
                // eventTypeRef will be reset in handleDragEnd
            } else {
                // If drag never started, reset eventTypeRef here
                eventTypeRef.current = null;
            }
        },
        [handleDragEnd, dragging]
    );

    const handleTouchEnd = useCallback(
        (e: TouchEvent) => {
            // Only handle if touch event started the drag
            if (eventTypeRef.current !== 'touch') {
                return;
            }

            const touch = e.changedTouches[0] || e.touches[0];
            if (!touch) {
                return;
            }

            const { clientX, clientY } = touch;
            // Only end drag if we're actually dragging (don't end if swipe never started)
            if (dragging) {
                handleDragEnd(clientX, clientY);
                // eventTypeRef will be reset in handleDragEnd
            } else {
                // If drag never started, reset eventTypeRef here
                eventTypeRef.current = null;
            }
        },
        [handleDragEnd, dragging]
    );

    const handlePointerDown = useCallback(
        (e: PointerEvent) => {
            // Don't interfere with drag handle
            if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
                return;
            }

            // Ignore if touch or mouse event already started
            if (eventTypeRef.current && eventTypeRef.current !== 'pointer') {
                return;
            }

            eventTypeRef.current = 'pointer';
            pointerIdRef.current = e.pointerId;
            const { clientX, clientY } = e;
            const left = (e.currentTarget as HTMLTableRowElement)?.getBoundingClientRect()?.left;
            handleDragStart(clientX, clientY, left);
        },
        [handleDragStart]
    );

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            // Only handle if pointer event started the drag
            if (eventTypeRef.current !== 'pointer') {
                return;
            }

            // Validate that this pointermove matches the pointerdown that started the drag
            if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) {
                return;
            }

            const { clientX, clientY } = e;
            const handled = handleDrag(clientX, clientY, e);
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [handleDrag]
    );

    const handlePointerUp = useCallback(
        (e: PointerEvent) => {
            // Only handle if pointer event started the drag
            if (eventTypeRef.current !== 'pointer') {
                return;
            }

            // Validate that this pointerup matches the pointerdown that started the drag
            if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) {
                return;
            }

            // pointerup event may not have clientX/clientY if pointer left the element
            // Use lastClientXRef as fallback if clientX/clientY are invalid
            const clientX =
                e.clientX !== undefined && e.clientX !== 0 ? e.clientX : (lastClientXRef.current ?? undefined);
            const clientY =
                e.clientY !== undefined && e.clientY !== 0 ? e.clientY : (lastClientYRef.current ?? undefined);

            // Only end drag if we're actually dragging (don't end if swipe never started)
            if (dragging) {
                handleDragEnd(clientX, clientY);
                // eventTypeRef will be reset in handleDragEnd
            } else {
                // If drag never started, reset eventTypeRef here
                eventTypeRef.current = null;
            }
        },
        [handleDragEnd, dragging]
    );

    // Update touch-action based on panel state
    useEffect(() => {
        const el = activeRef.current;
        if (!el) return;

        const table = el.closest('table');
        if (!table) return;

        // Set touch-action based on panel state (none when open, pan-y when closed)
        if (visible && x !== undefined && x !== 0) {
            // Panel is open - block scrolling
            table.style.touchAction = 'none';
        } else {
            // Panel is closed - allow vertical scrolling
            table.style.touchAction = 'pan-y';
        }

        return () => {
            table.style.touchAction = '';
        };
    }, [visible, x]);

    useEffect(() => {
        const el = activeRef.current;
        if (!el) return;

        const handleMouseLeave = () => {
            // Only handle if mouse event started the drag
            if (eventTypeRef.current === 'mouse') {
                // mouseleave doesn't have clientX/clientY, so use lastClientXRef as fallback
                const endClientX = lastClientXRef.current ?? undefined;
                const endClientY = lastClientYRef.current ?? undefined;
                if (dragging) {
                    handleDragEnd(endClientX, endClientY);
                }
            }
        };

        el.addEventListener('mousedown', handleMouseDown, { passive: false });
        el.addEventListener('mousemove', handleMouseMove, { passive: false });
        el.addEventListener('mouseup', handleMouseUp, { passive: false });
        el.addEventListener('mouseleave', handleMouseLeave, { passive: false });
        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd, { passive: false });
        el.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        el.addEventListener('pointerdown', handlePointerDown, { passive: false });
        el.addEventListener('pointermove', handlePointerMove, { passive: false });
        el.addEventListener('pointerup', handlePointerUp, { passive: false });
        el.addEventListener('pointercancel', handlePointerUp, { passive: false });

        return () => {
            el.removeEventListener('mousedown', handleMouseDown);
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseup', handleMouseUp);
            el.removeEventListener('mouseleave', handleMouseLeave);
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
            el.removeEventListener('touchcancel', handleTouchEnd);
            el.removeEventListener('pointerdown', handlePointerDown);
            el.removeEventListener('pointermove', handlePointerMove);
            el.removeEventListener('pointerup', handlePointerUp);
            el.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleDragEnd,
        id,
        dragging,
        sliding,
    ]);

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
