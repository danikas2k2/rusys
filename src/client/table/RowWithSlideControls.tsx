import React, {
    cloneElement,
    useCallback,
    useEffect,
    useRef,
    useState,
    type HTMLAttributes,
    type JSX,
    type ReactElement,
    type RefAttributes,
} from 'react';

import { defer } from 'lodash';

import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { POINTER_MOVE_THRESHOLD } from '@ui/utils/values';

import { Row, type RowProps } from '~/client/table/Row';

export interface RowWithSlideControlsProps extends RowProps {
    controls?: ReactElement<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>>;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onDrag?: () => void;
}

// TODO add animation for transform changes (using css transition but not to remove block while in transition)
export function RowWithSlideControls({
    ref: forwardedRef,
    children,
    controls,
    onDragStart,
    onDragEnd,
    onDrag,
    ...props
}: RowWithSlideControlsProps): JSX.Element {
    const ref = useForwardedRef(forwardedRef);
    const controlsRef = useRef<HTMLDivElement>(null);
    const [sliding, setSliding] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [moving, setMoving] = useState(false);
    const [x, setX] = useState<number>();
    const [initialX, setInitialX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    // reset offset when no controls specified
    // TODO add animation for transform changes (using css transition but not to remove block while in transition)
    if (!controls && x) {
        setX(undefined);
        setInitialX(0);
    }

    const [prevX, setPrevX] = useState(0);
    const dragged = x !== prevX && dragging && moving;
    useEffect(() => setPrevX(x ?? 0), [x]);
    useEffect(() => {
        if (dragged) {
            defer(() => onDrag?.());
        }
    }, [dragged, onDrag]);

    const getControlWidth = useCallback(
        (): number =>
            // right offset
            (document.documentElement?.getBoundingClientRect()?.right ?? 0) -
            (ref.current?.getBoundingClientRect()?.right ?? 0) +
            // controls width
            (controlsRef.current?.offsetWidth ?? 0),
        [ref]
    );

    // TODO optimize not to render controls while not dragging if not visible
    const handleDragStart = useCallback(
        (clientX: number, clientY: number, left = 0) => {
            if (!dragging) {
                setInitialX(x ?? 0);
                setOffsetX(clientX - left - (x ?? 0));
                setOffsetY(clientY);
                setDragging(true);
                onDragStart?.();
            }
        },
        [dragging, onDragStart, x]
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
                    }
                    setMoving(true);
                }
                if (slide) {
                    const width = getControlWidth();
                    if (width) {
                        if (-dx > width) {
                            dx = -width;
                        } else if (dx >= 0) {
                            dx = undefined;
                        }
                    }
                    dx &&= Math.round(dx);
                    if (x !== dx) {
                        setX(dx);
                    }
                    return true;
                }
            }
            return false;
        },
        [dragging, getControlWidth, moving, offsetX, offsetY, sliding, x]
    );

    const handleDragEnd = useCallback(() => {
        if (dragging && sliding) {
            if (x != null) {
                const width = getControlWidth();
                if (width) {
                    let w: number | undefined;
                    if (-x >= width * (x > initialX ? 0.95 : 0.75)) {
                        w = -width;
                    } else if (-x < width * 0.25) {
                        w = undefined;
                    } else if (initialX > x) {
                        w = -width;
                    } else {
                        w = undefined;
                    }
                    w &&= Math.round(w);
                    if (x !== w) {
                        setX(w);
                    }
                }
            }
            setDragging(false);
            setSliding(false);
            setMoving(false);
            onDragEnd?.();
        }
    }, [dragging, getControlWidth, initialX, onDragEnd, sliding, x]);

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            const { clientX, clientY } = e;
            handleDragStart(clientX, clientY, (e.currentTarget as HTMLDivElement)?.getBoundingClientRect()?.left);
        },
        [handleDragStart]
    );

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            const [{ clientX, clientY }] = e.changedTouches;
            handleDragStart(clientX, clientY, (e.currentTarget as HTMLDivElement)?.getBoundingClientRect()?.left);
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
        const el = ref.current;
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
    }, [handleDragEnd, handleMouseDown, handleMouseMove, handleTouchMove, handleTouchStart, ref]);

    return (
        <Row
            {...props}
            ref={ref}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            {children}
            {controls &&
                cloneElement(controls, {
                    ref: controlsRef,
                    style: {
                        ...controls.props?.style,
                        ...(x ? { transform: `${controls.props?.style?.transform ?? ''} translateX(${x}px)` } : {}),
                    },
                })}
        </Row>
    );
}
