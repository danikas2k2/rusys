import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import classNames from 'classnames';
import React, {
    cloneElement,
    type CSSProperties,
    forwardRef,
    type ReactElement,
    type Ref,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { DraggableCore, type DraggableData, type DraggableEvent } from 'react-draggable';
import { Row, type RowProps } from '~/client/table/Row';
import { usePreviousValue } from '~/hooks/usePreviousValue';
import cx from './SortableRow.less';

const DRAG_THRESHOLD = 10;

interface SortableRowProps extends RowProps {
    index: number;
    onStart?: () => void;
    onStop?: () => void;
    onMove?: (offset: { x?: number; y?: number }) => void;
    handler?: ReactElement;
    controls?: ReactElement;
}

// TODO separate two components: SortableRow and RowWithControls
export const SortableRow = forwardRef(function SortableRow(
    { index, handler, controls, onStart, onStop, onMove, className, style, children, ...props }: SortableRowProps,
    forwardedRef: Ref<HTMLDivElement>
) {
    const ref = useForwardedRef(forwardedRef);
    const handleRef = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [vertical, setVertical] = useState<boolean>();
    const [x, setX] = useState<number>();
    const [y, setY] = useState<number>();
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    // reset offset when no controls specified
    if (!controls && x) {
        setX(undefined);
    }

    // call onMove when dragging and x/y changed but index doesn't (index changes on re-sorting)
    const prevIndex = usePreviousValue(index) ?? index;
    const direction = Math.sign(index - prevIndex);
    useEffect(() => {
        if (dragging && !direction) {
            onMove?.({ x, y });
        }
    }, [direction, dragging, onMove, x, y]);

    const handleDragStart = useCallback(
        ({ target }: DraggableEvent, data: DraggableData) => {
            const v = handleRef.current === target || handleRef.current?.contains(target as Node);
            setVertical(v);
            if (v) {
                if (x) {
                    setX(undefined);
                }
            } else {
                if (y != null) {
                    setY(undefined);
                }
            }
            setOffsetX(data.x - data.node.offsetLeft);
            setOffsetY(data.y - data.node.offsetTop);
            onStart?.();
        },
        [onStart, x, y]
    );

    const handleHorizontalDrag = useCallback(
        (data: DraggableData) => {
            let newX: number | undefined = data.x - offsetX;
            const width = controlRef.current?.offsetWidth ?? 0;
            if (-newX > width) {
                newX = -width;
            } else if (newX >= 0) {
                newX = undefined;
            }
            newX &&= Math.round(newX);
            if (x !== newX) {
                setX(newX);
            }
        },
        [offsetX, x]
    );

    const handleHorizontalDragStop = useCallback(() => {
        if (x != null) {
            let newX: number | undefined;
            const width = controlRef.current?.offsetWidth ?? 0;
            if (-x >= width * 0.75) {
                newX = -width;
            } else if (-x < width * 0.25) {
                newX = undefined;
            } else if (offsetX > x) {
                newX = -width;
            } else {
                newX = undefined;
            }
            newX &&= Math.round(newX);
            if (x !== newX) {
                setX(newX);
            }
        }
    }, [offsetX, x]);

    const handleVerticalDrag = useCallback(
        (data: DraggableData) => {
            const height = ((data.node.offsetParent as HTMLElement)?.offsetHeight ?? 0) - data.node.offsetHeight;
            const newY = Math.round(Math.min(Math.max(0, data.y - offsetY), height));
            if (y !== newY) {
                setY(newY);
            }
        },
        [offsetY, y]
    );

    const handleVerticalDragStop = useCallback(() => {
        if (y != null) {
            setY(undefined);
        }
    }, [y]);

    const handleDrag = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const v = Math.abs(data.y - offsetY);
            const h = Math.abs(data.x - offsetX);
            if (!dragging) {
                if (v < DRAG_THRESHOLD && h < DRAG_THRESHOLD) {
                    return;
                }
                setDragging(true);
            }
            if (vertical) {
                handleVerticalDrag(data);
            } else {
                handleHorizontalDrag(data);
            }
        },
        [dragging, handleHorizontalDrag, handleVerticalDrag, offsetX, offsetY, vertical]
    );

    const handleDragStop = useCallback(() => {
        setDragging(false);
        setVertical(undefined);
        handleVerticalDragStop();
        handleHorizontalDragStop();
        onStop?.();
    }, [handleHorizontalDragStop, handleVerticalDragStop, onStop]);

    // calculates delta for vertical position when index changes
    const sibling = (
        direction > 0 ? ref.current?.nextElementSibling : ref.current?.previousElementSibling
    ) as HTMLElement | null;
    const delta = (ref.current?.offsetTop ?? 0) + direction * (direction ? sibling?.offsetHeight ?? 0 : 0);
    const dy = y != null ? y - delta : y;

    return (
        <DraggableCore
            onStart={handleDragStart}
            onStop={handleDragStop}
            onDrag={handleDrag}
            allowAnyClick
            enableUserSelectHack
        >
            <Row
                ref={ref}
                className={classNames(className, cx({ 'mod-dragging': dragging, 'mod-vertical': vertical }))}
                style={addTransformStyle(style, dy ? `translate(0, ${dy}px)` : '')}
                {...props}
            >
                {handler && cloneElement(handler, { ref: handleRef })}
                {children}
                {controls &&
                    cloneElement(controls, {
                        ref: controlRef,
                        style: addTransformStyle(controls?.props?.style, x ? `translate(${x}px, 0)` : ''),
                    })}
            </Row>
        </DraggableCore>
    );
});

function addTransformStyle(style?: CSSProperties, transform?: string): CSSProperties {
    return {
        ...style,
        ...(transform ? { transform: [style?.transform, transform].filter(Boolean).join(' ') } : {}),
    };
}
