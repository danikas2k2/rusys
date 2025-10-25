import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Table } from '@mantine/core';

import { POINTER_MOVE_THRESHOLD } from '@ui/utils/values';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { useSwipePanelWidth } from '~/client/common/SwipeControlsContext';

interface SwipeableTableRowProps<D = ActiveContentData> {
    readonly id: string;
    readonly data: D;
    readonly style?: React.CSSProperties;
    readonly ref: (element: HTMLTableRowElement | null) => void;
}

export function SwipeableTableRow<D = ActiveContentData>({
    id,
    data,
    style,
    ref,
    children,
}: React.PropsWithChildren<SwipeableTableRowProps<D>>) {
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

    const isActive = active?.data === data;

    // Update active with transform when x changes
    useEffect(() => {
        if (isActive && x !== undefined) {
            setActive({ id, data, ref: activeRef, offset: x });
        }
    }, [x, isActive, data, setActive, id]);

    // Reset offset when row becomes inactive
    useEffect(() => {
        if (!isActive && x) {
            setX(undefined);
            setInitialX(0);
        }
    }, [isActive, x]);

    const handleDragStart = useCallback(
        (clientX: number, clientY: number, left = 0) => {
            if (!dragging) {
                setInitialX(x ?? 0);
                setOffsetX(clientX - left - (x ?? 0));
                setOffsetY(clientY);
                setDragging(true);
            }
        },
        [dragging, x]
    );

    const handleDrag = useCallback(
        (clientX: number, clientY: number) => {
            if (dragging) {
                let slide = sliding;
                const dy: number | undefined = clientY - offsetY;
                let dx: number | undefined = clientX - offsetX;

                if (!moving) {
                    if (Math.abs(dx) < POINTER_MOVE_THRESHOLD) {
                        return;
                    }
                    if (Math.abs(dx) > Math.abs(dy)) {
                        setSliding((slide = true));
                        // Set active row only when sliding actually starts
                        setActive({ id, data, ref: activeRef });
                    }
                    setMoving(true);
                }

                if (slide) {
                    // Limit swipe to controls width (can't swipe more than that)
                    if (-dx > controlsWidth) {
                        dx = -controlsWidth;
                    } else if (dx > 0) {
                        // Can't swipe right beyond closed position
                        dx = 0;
                    }

                    dx = Math.round(dx);
                    if (x !== dx) {
                        setX(dx);
                    }
                    return true;
                }
            }
            return false;
        },
        [dragging, sliding, offsetY, offsetX, moving, setActive, id, data, controlsWidth, x]
    );

    const handleDragEnd = useCallback(() => {
        if (dragging) {
            if (sliding && x != null) {
                const deltaX = x - initialX;

                let targetX: number;
                const CLOSE_POSITION = 0;
                const OPEN_POSITION = -Math.round(controlsWidth);

                if (initialX === CLOSE_POSITION) {
                    // Starting from closed - decide open or stay closed
                    targetX = -deltaX >= POINTER_MOVE_THRESHOLD ? OPEN_POSITION : CLOSE_POSITION;
                } else {
                    // Starting from open - decide close or stay open
                    targetX = deltaX >= POINTER_MOVE_THRESHOLD ? CLOSE_POSITION : OPEN_POSITION;
                }

                // Ensure exact pixel alignment
                targetX = Math.round(targetX);

                if (targetX === CLOSE_POSITION) {
                    // Closing - set x to 0 and clear active
                    setX(undefined);
                    setActive(undefined);
                } else {
                    // Opening or staying open
                    setX(targetX);
                    if (targetX !== x) {
                        setActive({ id, data, ref: activeRef, offset: targetX });
                    }
                }
            }
            setDragging(false);
            setSliding(false);
            setMoving(false);
        }
    }, [dragging, sliding, x, initialX, controlsWidth, setActive, id, data]);

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            // Don't interfere with drag handle
            if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
                return;
            }

            const { clientX, clientY } = e;
            handleDragStart(clientX, clientY, (e.currentTarget as HTMLTableRowElement)?.getBoundingClientRect()?.left);
        },
        [handleDragStart]
    );

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            // Don't interfere with drag handle
            if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
                return;
            }

            const [{ clientX, clientY }] = e.changedTouches;
            handleDragStart(clientX, clientY, (e.currentTarget as HTMLTableRowElement)?.getBoundingClientRect()?.left);
        },
        [handleDragStart]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            const { clientX, clientY } = e;
            if (handleDrag(clientX, clientY)) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [handleDrag]
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            const [{ clientX, clientY }] = e.changedTouches;
            if (handleDrag(clientX, clientY)) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [handleDrag]
    );

    useEffect(() => {
        const el = activeRef.current;
        el?.addEventListener('mousedown', handleMouseDown, { passive: false });
        el?.addEventListener('mousemove', handleMouseMove, { passive: false });
        el?.addEventListener('mouseup', handleDragEnd, { passive: false });
        el?.addEventListener('mouseleave', handleDragEnd, { passive: false });
        el?.addEventListener('touchstart', handleTouchStart, { passive: false });
        el?.addEventListener('touchmove', handleTouchMove, { passive: false });
        el?.addEventListener('touchend', handleDragEnd, { passive: false });
        el?.addEventListener('touchcancel', handleDragEnd, { passive: false });
        return () => {
            el?.removeEventListener('mousedown', handleMouseDown);
            el?.removeEventListener('mousemove', handleMouseMove);
            el?.removeEventListener('mouseup', handleDragEnd);
            el?.removeEventListener('mouseleave', handleDragEnd);
            el?.removeEventListener('touchstart', handleTouchStart);
            el?.removeEventListener('touchmove', handleTouchMove);
            el?.removeEventListener('touchend', handleDragEnd);
            el?.removeEventListener('touchcancel', handleDragEnd);
        };
    }, [handleDragEnd, handleMouseDown, handleMouseMove, handleTouchMove, handleTouchStart]);

    // Combine refs
    const combinedRef = useCallback(
        (node: HTMLTableRowElement | null) => {
            activeRef.current = node;
            ref(node);
        },
        [ref]
    );

    const handleClick = (e: React.MouseEvent) => {
        // If controls are open and clicking on the row (not on controls), close them
        if (isActive && !dragging && !active?.pinned) {
            // Don't close if clicking on the drag handle or controls
            const target = e.target as HTMLElement;
            if (
                !target.closest('[data-drag-handle]') &&
                !target.closest('[role="button"]') && // TODO check if this is needed
                !target.closest('[data-swipe-controls]')
            ) {
                setX(undefined);
                setActive(undefined);
            }
        }
    };

    return (
        <Table.Tr ref={combinedRef} style={style} onClick={handleClick}>
            {children}
        </Table.Tr>
    );
}
