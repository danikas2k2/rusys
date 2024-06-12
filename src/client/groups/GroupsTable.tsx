import DeleteIcon from '@icons/Delete.svg';
import DragHandleIcon from '@icons/DragHandle.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, {
    cloneElement,
    CSSProperties,
    forwardRef,
    type HTMLAttributes,
    type PropsWithChildren,
    ReactElement,
    type Ref,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { DraggableCore, type DraggableData, type DraggableEvent } from 'react-draggable';
import { Label } from '~/client/Label';
import { Cell } from '~/client/table/Cell';
import { LoadingContent } from '~/client/table/LoadingContent';
import { Row, type RowProps } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { matchParts } from '~/client/utils/matchParts';
import { usePreviousValue } from '~/hooks/usePreviousValue';
import { useFilter } from '~/state/filter/useFilter';
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGroups } from '~/state/groups/useGroups';
import { useReorderGroups } from '~/state/groups/useReorderGroups';
import cx from './GroupsTable.less';

interface SortableRowProps extends RowProps {
    index: number;
    onStart?: () => void;
    onStop?: () => void;
    onMove?: (offset: { x?: number; y?: number }) => void;
    handler?: ReactElement;
    controls?: ReactElement;
}

const SortableRow = forwardRef(function SortableRow(
    { index, handler, controls, onStart, onStop, onMove, className, style, children, ...props }: SortableRowProps,
    forwardedRef: Ref<HTMLDivElement>
) {
    const ref = useForwardedRef(forwardedRef);
    // ref for vertical drag handler
    const handleRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [x, setX] = useState<number>();
    const [y, setY] = useState<number>();
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    // reset offset when no controls specified
    if (!controls && x) {
        setX(undefined);
    }

    const prevIndex = usePreviousValue(index) ?? index;
    const direction = Math.sign(index - prevIndex);
    useEffect(() => {
        if (dragging && !direction) {
            onMove?.({ x, y });
        }
    }, [direction, dragging, onMove, x, y]);

    const handleDragStart = useCallback(
        ({ target }: DraggableEvent, data: DraggableData) => {
            const newVertical = handleRef.current === target || handleRef.current?.contains(target as Node);
            setVertical(newVertical);

            if (newVertical) {
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

    const controlRef = useRef<HTMLDivElement>(null);
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

    const handleHorizontalDragEnd = useCallback(() => {
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

    const handleVerticalDragEnd = useCallback(() => {
        if (y != null) {
            setY(undefined);
        }
    }, [y]);

    const [vertical, setVertical] = useState<boolean>();
    const dragThreshold = 8;

    const handleDrag = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const v = Math.abs(data.y - offsetY);
            const h = Math.abs(data.x - offsetX);
            if (!dragging) {
                if (v < dragThreshold && h < dragThreshold) {
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

    const handleDragEnd = useCallback(() => {
        setDragging(false);
        setVertical(undefined);
        handleVerticalDragEnd();
        handleHorizontalDragEnd();
        onStop?.();
    }, [handleHorizontalDragEnd, handleVerticalDragEnd, onStop]);

    const sibling = (
        direction > 0 ? ref.current?.nextElementSibling : ref.current?.previousElementSibling
    ) as HTMLElement | null;
    const delta = (ref.current?.offsetTop ?? 0) + direction * (direction ? sibling?.offsetHeight ?? 0 : 0);
    const dy = y != null ? y - delta : y;

    return (
        <DraggableCore
            onStart={handleDragStart}
            onStop={handleDragEnd}
            onDrag={handleDrag}
            allowAnyClick
            enableUserSelectHack
        >
            <Row
                ref={ref}
                {...props}
                className={cx(className, { 'mod-dragging': dragging, 'mod-vertical': vertical })}
                style={addTransformStyle(style, dy ? `translate(0, ${dy}px)` : '')}
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

const SortableRowGroup = forwardRef(function SortableRowGroup(
    { children, className, ...props }: HTMLAttributes<HTMLDivElement>,
    ref: Ref<HTMLDivElement>
) {
    return (
        <div ref={ref} className={classNames(className, cx('SortableRowGroup'))} {...props}>
            {children}
        </div>
    );
});

const GroupControls = forwardRef(function GroupControls(
    { className, ...props }: HTMLAttributes<HTMLDivElement>,
    ref: Ref<HTMLDivElement>
) {
    return (
        <div ref={ref} className={classNames(className, cx('Controls'))} {...props}>
            <ButtonGroup align="right">
                <Button color="primary" startDecorator={<EditIcon />}>
                    <Label>Edit</Label>
                </Button>
                <Button color="negative" startDecorator={<DeleteIcon />}>
                    <Label>Remove</Label>
                </Button>
            </ButtonGroup>
        </div>
    );
});

export function GroupsTable() {
    const getGroups = useGetGroups();
    const groups = useGroups();

    const filter = useFilter();
    const filteredGroups = useMemo(
        () => groups.filter((v) => matchParts(v.group, filter)).sort((a, b) => a.order - b.order),
        [filter, groups]
    );

    const groupOrder = useMemo(() => filteredGroups.map((v) => v.group), [filteredGroups]);
    const [currentGroupOrder, setCurrentGroupOrder] = useState(groupOrder);
    useEffect(() => {
        setCurrentGroupOrder(groupOrder);
    }, [groupOrder]);

    const onOverlap = useCallback(
        (group: string, opposite?: string) => {
            if (opposite) {
                const newOrder = [...currentGroupOrder];
                newOrder[currentGroupOrder.indexOf(group)] = opposite;
                newOrder[currentGroupOrder.indexOf(opposite)] = group;
                setCurrentGroupOrder(newOrder);
            }
        },
        [currentGroupOrder]
    );

    const [currentGroup, setCurrentGroup] = useState<string>();
    const onStart = useCallback(
        (group: string) => {
            if (group !== currentGroup) {
                setCurrentGroup(group);
            }
        },
        [currentGroup]
    );
    const currentRef = useRef<HTMLDivElement>(null);
    useOutsideClick(currentRef, () => {
        setCurrentGroup(undefined);
    });

    const reorderGroups = useReorderGroups();
    const onStop = useCallback(async () => {
        if (!isEqual(currentGroupOrder, groupOrder)) {
            await reorderGroups(
                Object.fromEntries(
                    currentGroupOrder.map((g, i) => [g, i] as const).filter(([g], i) => i !== groupOrder.indexOf(g))
                )
            );
        }
    }, [currentGroupOrder, groupOrder, reorderGroups]);

    const ref = useRef<HTMLDivElement>(null);

    const onMove = useCallback(
        ({ y }: { x?: number; y?: number }) => {
            if (y != null) {
                if (currentGroup) {
                    setTimeout(() => {
                        const overlap = getOverlappingElementIndex(currentRef.current);
                        if (overlap >= 0) {
                            onOverlap(currentGroup, currentGroupOrder[overlap]);
                        }
                    }, 0);
                }
            }
        },
        [currentGroup, currentGroupOrder, onOverlap]
    );

    return (
        <LoadingContent loader={getGroups} hasData={!isEmpty(groups)}>
            <Table className={cx('Table')}>
                <SortableRowGroup ref={ref}>
                    {currentGroupOrder.map((group, i) => {
                        return (
                            <SortableRow
                                key={group}
                                index={i}
                                ref={currentGroup === group ? currentRef : undefined}
                                className={cx('Row')}
                                onStart={() => onStart(group)}
                                onStop={onStop}
                                onMove={onMove}
                                handler={
                                    <div className={cx('DragHandle')}>
                                        <DragHandleIcon />
                                    </div>
                                }
                                controls={
                                    currentGroup === group ? <GroupControls style={{ color: 'red' }} /> : undefined
                                }
                            >
                                <Cell key="name" className={cx('Name')}>
                                    {group}
                                </Cell>
                            </SortableRow>
                        );
                    })}
                </SortableRowGroup>
            </Table>
        </LoadingContent>
    );
}

function getOverlappingElementIndex(element: HTMLElement | null, overlapSize = 0.3): number {
    if (element) {
        const rect = element.getBoundingClientRect();
        const parent = element.offsetParent as HTMLElement | null;
        if (parent) {
            const children = parent.children as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child === element) {
                    continue;
                }
                const childRect = child.getBoundingClientRect();
                if (
                    (childRect.top >= rect.top && childRect.top <= rect.top + rect.height * overlapSize) ||
                    (rect.top >= childRect.top && rect.top <= childRect.top + childRect.height * overlapSize)
                ) {
                    return i;
                }
            }
        }
    }
    return -1;
}
