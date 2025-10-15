import React, {
    cloneElement,
    useCallback,
    useEffect,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactElement,
    type RefAttributes,
} from 'react';

import cs from 'classnames';
import { defer } from 'lodash';

import { useForwardedRef } from '@ui/hooks/useForwardedRef';

import { RowWithSlideControls, type RowWithSlideControlsProps } from '~/client/table/RowWithSlideControls';
import cx from './SortableRow.pcss';

export interface SortableRowProps extends RowWithSlideControlsProps {
    index: number;
    handle: ReactElement<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement> & { dragging: boolean }>;
}

export function SortableRow({
    ref: forwardedRef,
    children,
    index,
    className,
    style,
    handle,
    onDragStart,
    onDragEnd,
    onDrag,
    ...props
}: SortableRowProps) {
    const ref = useForwardedRef(forwardedRef);
    const handleRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [y, setY] = useState<number>(0);
    const [dy, setDy] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [bottom, setBottom] = useState(0);
    const [top, setTop] = useState(0);
    const [offsetTop, setOffsetTop] = useState(0);
    const [sibling, setSibling] = useState<HTMLElement | null>(null);

    const [prevIndex, setPrevIndex] = useState(index);
    const direction = Math.sign(index - prevIndex);
    useEffect(() => setPrevIndex(index), [index]);

    const [prevY, setPrevY] = useState(0);
    const dragged = y !== prevY && dragging && !direction;
    useEffect(() => setPrevY(y), [y]);
    useEffect(() => {
        if (dragged) {
            defer(() => onDrag?.());
        }
    }, [dragged, onDrag]);

    const handleDragStart = useCallback(
        (clientY: number, clientTop = 0) => {
            setOffsetY(clientY - clientTop);
            if (y) {
                setY(0);
            }
            setDragging(true);
            onDragStart?.();
        },
        [onDragStart, y]
    );

    const handleDrag = useCallback(
        (clientY: number) => {
            if (dragging) {
                const v = clientY - offsetY;
                if (y !== v) {
                    setY(v);
                }
            }
        },
        [offsetY, dragging, y]
    );

    const handleDragEnd = useCallback(() => {
        if (dragging) {
            if (y) {
                setY(0);
            }
            setDragging(false);
            onDragEnd?.();
        }
    }, [dragging, onDragEnd, y]);

    // Update ref-dependent values when dragging or y changes
    useEffect(() => {
        if (ref.current) {
            const { top: newTop = 0, bottom: newBottom = 0 } = ref.current.offsetParent?.getBoundingClientRect() ?? {};
            setTop(newTop);
            setBottom(newBottom);
            setOffsetTop(ref.current.offsetTop);

            const newSibling = (
                direction > 0 ? ref.current.nextElementSibling : ref.current.previousElementSibling
            ) as HTMLElement | null;
            setSibling(newSibling);
        }
    }, [dragging, y, direction, ref]);

    // Calculate oy and dy when relevant values change
    useEffect(() => {
        const oy =
            Math.max(Math.min(y ?? 0, bottom - (ref.current?.getBoundingClientRect()?.height ?? 0)), top) -
            top -
            ((y && offsetTop) ?? 0);

        const newDy = oy && oy - direction * (direction ? (sibling?.offsetHeight ?? 0) : 0);
        setDy(newDy);
    }, [y, bottom, top, offsetTop, direction, sibling, ref]);

    const handleContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleStart = useCallback(
        (e: MouseEvent | TouchEvent, clientY: number) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragStart(clientY, (e.currentTarget as HTMLDivElement)?.getBoundingClientRect().top ?? 0);
        },
        [handleDragStart]
    );

    const handleMouseDown = useCallback((e: MouseEvent) => handleStart(e, e.clientY), [handleStart]);
    const handleTouchStart = useCallback((e: TouchEvent) => handleStart(e, e.targetTouches[0].clientY), [handleStart]);

    const handleMove = useCallback(
        (e: MouseEvent | TouchEvent, clientY: number) => {
            if (dragging) {
                e.preventDefault();
                e.stopPropagation();
            }
            handleDrag(clientY);
        },
        [dragging, handleDrag]
    );

    const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e, e.clientY), [handleMove]);
    const handleTouchMove = useCallback((e: TouchEvent) => handleMove(e, e.targetTouches[0].clientY), [handleMove]);

    const handleEnd = useCallback(
        (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragEnd();
        },
        [handleDragEnd]
    );

    useEffect(() => {
        const el = handleRef.current;
        el?.addEventListener('contextmenu', handleContextMenu, { passive: false });
        el?.addEventListener('mousedown', handleMouseDown, { passive: false });
        el?.addEventListener('mouseup', handleEnd, { passive: false });
        el?.addEventListener('mousemove', handleMouseMove, { passive: false });
        el?.addEventListener('mouseleave', handleEnd, { passive: false });
        el?.addEventListener('touchstart', handleTouchStart, { passive: false });
        el?.addEventListener('touchend', handleEnd, { passive: false });
        el?.addEventListener('touchmove', handleTouchMove, { passive: false });
        el?.addEventListener('touchcancel', handleEnd, { passive: false });
        return () => {
            el?.removeEventListener('contextmenu', handleContextMenu);
            el?.removeEventListener('mousedown', handleMouseDown);
            el?.removeEventListener('mouseup', handleEnd);
            el?.removeEventListener('mousemove', handleMouseMove);
            el?.removeEventListener('mouseleave', handleEnd);
            el?.removeEventListener('touchstart', handleTouchStart);
            el?.removeEventListener('touchend', handleEnd);
            el?.removeEventListener('touchmove', handleTouchMove);
            el?.removeEventListener('touchcancel', handleEnd);
        };
    }, [handleContextMenu, handleEnd, handleMouseDown, handleMouseMove, handleTouchMove, handleTouchStart]);

    return (
        <RowWithSlideControls
            {...props}
            ref={ref}
            className={cs(className, cx({ dragging }))}
            style={{
                ...style,
                ...(dragging && dy ? { transform: `${style?.transform ?? ''} translateY(${dy}px)` } : {}),
            }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {handle &&
                // eslint-disable-next-line react-hooks/refs
                cloneElement(handle, {
                    ref: handleRef,
                    dragging,
                })}
            {children}
        </RowWithSlideControls>
    );
}
