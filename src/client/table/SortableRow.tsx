import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import cs from 'classnames';
import {
    cloneElement,
    forwardRef,
    type MouseEvent,
    type PointerEvent,
    type ReactElement,
    type Ref,
    useCallback,
    useRef,
    useState,
} from 'react';
import { RowWithSlideControls, type RowWithSlideControlsProps } from '~/client/table/RowWithSlideControls';
import { usePreviousValue } from '~/hooks/usePreviousValue';
import cx from './SortableRow.less';

interface SortableRowProps extends RowWithSlideControlsProps {
    index: number;
    handle: ReactElement;
    onMove?: () => void;
}

export const SortableRow = forwardRef(function SortableRow(
    {
        children,
        index,
        className,
        style,
        handle,
        onStart,
        onStop,
        onMove,
        onContextMenu,
        onPointerDown,
        onPointerUp,
        onPointerMove,
        onPointerLeave,
        onPointerCancel,
        ...props
    }: SortableRowProps,
    forwardedRef: Ref<HTMLDivElement>
) {
    const ref = useForwardedRef(forwardedRef);
    const handleRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [y, setY] = useState<number>();
    const [offsetY, setOffsetY] = useState(0);
    const yChanged = y !== usePreviousValue(y);

    const prevIndex = usePreviousValue(index) ?? index;
    const direction = Math.sign(index - prevIndex);
    if (dragging && !direction && yChanged) {
        onMove?.();
    }

    const handlePointerDown = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            if (dragging || (handleRef.current !== e.target && !handleRef.current?.contains(e.target as HTMLElement))) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            e.currentTarget.setPointerCapture(e.pointerId);

            setOffsetY(e.clientY - (e.currentTarget.getBoundingClientRect().top ?? 0));
            if (y != null) {
                setY(undefined);
            }
            setDragging(true);
            onStart?.();
        },
        [dragging, onStart, y]
    );

    const handlePointerMove = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            if (!dragging || !e.movementY) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const v = e.clientY - offsetY;
            if (y !== v) {
                setY(v);
            }
        },
        [offsetY, dragging, y]
    );

    const handlePointerUp = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            if (!dragging) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (y != null) {
                setY(undefined);
            }
            setDragging(false);
            onStop?.();
        },
        [dragging, onStop, y]
    );

    const handlePointerCancel = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            handlePointerUp(e);
        },
        [handlePointerUp]
    );

    const handlePointerLeave = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            if (!dragging) {
                return;
            }
            handlePointerUp(e);
        },
        [dragging, handlePointerUp]
    );

    const { top = 0, bottom = 0 } = ref.current?.offsetParent?.getBoundingClientRect() ?? {};
    const oy =
        Math.max(Math.min(y ?? 0, bottom - (ref.current?.getBoundingClientRect()?.height ?? 0)), top) -
        top -
        ((y && ref.current?.offsetTop) ?? 0);

    // calculates delta for vertical position when index changes
    const sibling = (
        direction > 0 ? ref.current?.nextElementSibling : ref.current?.previousElementSibling
    ) as HTMLElement | null;
    const dy = oy && oy - direction * (direction ? sibling?.offsetHeight ?? 0 : 0);

    return (
        <RowWithSlideControls
            ref={ref}
            className={cs(className, cx({ dragging }))}
            style={{
                ...style,
                ...(dragging && dy ? { transform: `${style?.transform ?? ''} translateY(${dy}px)` } : {}),
            }}
            onStart={onStart}
            onStop={onStop}
            onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                onContextMenu?.(e);
            }}
            onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
                onPointerDown?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerDown(e);
                }
            }}
            onPointerUp={(e: PointerEvent<HTMLDivElement>) => {
                onPointerUp?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerUp(e);
                }
            }}
            onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
                onPointerMove?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerMove(e);
                }
            }}
            onPointerCancel={(e: PointerEvent<HTMLDivElement>) => {
                onPointerCancel?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerCancel(e);
                }
            }}
            onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
                onPointerLeave?.(e);
                if (!e.isPropagationStopped()) {
                    handlePointerLeave(e);
                }
            }}
            {...props}
        >
            {handle &&
                cloneElement(handle, {
                    ref: handleRef,
                    dragging,
                })}
            {children}
        </RowWithSlideControls>
    );
});
