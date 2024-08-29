import { POINTER_MOVE_THRESHOLD } from '@ui/utils/values';
import {
    cloneElement,
    forwardRef,
    isValidElement,
    type PointerEventHandler,
    type ReactNode,
    type Ref,
    useCallback,
    useRef,
    useState,
} from 'react';
import { Row, type RowProps } from '~/client/table/Row';

export interface RowWithSlideControlsProps extends RowProps {
    controls: ReactNode;
    onStart?: () => void;
    onStop?: () => void;
}

// TODO add animation for transform changes (using css transition but not to remove block while in transition)
export const RowWithSlideControls = forwardRef(function RowWithSlideControls(
    {
        children,
        controls,
        onStart,
        onStop,
        onContextMenu,
        onPointerDown,
        onPointerUp,
        onPointerMove,
        onPointerLeave,
        onPointerCancel,
        ...props
    }: RowWithSlideControlsProps,
    forwardedRef: Ref<HTMLDivElement>
) {
    const ref = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [moving, setMoving] = useState(false);
    const [x, setX] = useState<number>();
    const [offsetX, setOffsetX] = useState(0);
    const [initialX, setInitialX] = useState(0);

    // reset offset when no controls specified
    // TODO add animation for transform changes (using css transition but not to remove block while in transition)
    if (!controls && x) {
        setX(undefined);
        setInitialX(0);
    }

    const handlePointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            if (dragging) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            setInitialX(x ?? 0);
            setOffsetX(e.clientX - (e.currentTarget.getBoundingClientRect().left ?? 0) - (x ?? 0));
            setDragging(true);
            onStart?.();
        },
        [dragging, onStart, x]
    );

    const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            if (!dragging || !e.movementX) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            let h: number | undefined = e.clientX - offsetX;
            if (!moving) {
                if (Math.abs(h) < POINTER_MOVE_THRESHOLD) {
                    return;
                }
                setMoving(true);
            }
            const width = ref.current?.offsetWidth ?? 0;
            if (-h > width) {
                h = -width;
            } else if (h >= 0) {
                h = undefined;
            }
            h &&= Math.round(h);
            if (x !== h) {
                setX(h);
            }
        },
        [dragging, moving, offsetX, x]
    );

    const handlePointerUp: PointerEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            if (!dragging) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            if (x != null) {
                let h: number | undefined;
                const width = ref.current?.offsetWidth ?? 0;
                if (-x >= width * (x > initialX ? 0.95 : 0.75)) {
                    h = -width;
                } else if (-x < width * 0.25) {
                    h = undefined;
                } else if (initialX > x) {
                    h = -width;
                } else {
                    h = undefined;
                }
                h &&= Math.round(h);
                if (x !== h) {
                    setX(h);
                }
            }
            setDragging(false);
            setMoving(false);
            onStop?.();
        },
        [dragging, initialX, onStop, x]
    );

    if (!isValidElement(controls)) {
        controls = <>{controls}</>;
    }

    return (
        <Row
            ref={forwardedRef}
            {...props}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onContextMenu?.(e);
            }}
            onPointerDown={(e) => {
                onPointerDown?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerDown(e);
                }
            }}
            onPointerUp={(e) => {
                onPointerUp?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerUp(e);
                }
            }}
            onPointerMove={(e) => {
                onPointerMove?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerMove(e);
                }
            }}
            onPointerLeave={(e) => {
                onPointerLeave?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerUp(e);
                }
            }}
            onPointerCancel={(e) => {
                onPointerCancel?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerUp(e);
                }
            }}
        >
            {children}
            {controls &&
                cloneElement(controls, {
                    ref,
                    style: {
                        ...controls.props?.style,
                        ...(x ? { transform: `${controls.props?.style?.transform ?? ''} translateX(${x}px)` } : {}),
                    },
                })}
        </Row>
    );
});
