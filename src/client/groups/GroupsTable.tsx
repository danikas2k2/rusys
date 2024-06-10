import DeleteIcon from '@icons/Delete.svg';
import DragHandleIcon from '@icons/DragHandle.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { isEmpty, isEqual } from 'lodash';
import React, {
    type HTMLAttributes,
    type PropsWithChildren,
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
        (group: string, opposite?: HTMLDivElement | null) => {
            const overlapGroup = opposite?.dataset.group;
            if (overlapGroup) {
                const newOrder = [...currentGroupOrder];
                newOrder[currentGroupOrder.indexOf(group)] = overlapGroup;
                newOrder[currentGroupOrder.indexOf(overlapGroup)] = group;
                setCurrentGroupOrder(newOrder);
            }
        },
        [currentGroupOrder]
    );

    const [current, setCurrent] = useState<HTMLDivElement | null>(null);
    const onStart = useCallback(
        (element: HTMLDivElement | null) => {
            if (element !== current) {
                setCurrent(element);
            }
        },
        [current]
    );
    useOutsideClick({ current }, () => {
        setCurrent(null);
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

    return (
        <LoadingContent loader={getGroups} hasData={!isEmpty(groups)}>
            <Table className={cx('Table')}>
                <SortableRowGroup>
                    {currentGroupOrder.map((group) => (
                        <SortableRow
                            key={group}
                            className={cx('Row')}
                            data-group={group}
                            data-order={filteredGroups.find((g) => g.group === group)?.order}
                            active={current?.dataset.group === group}
                            onStart={onStart}
                            onStop={onStop}
                            onOverlap={(opposite) => onOverlap(group, opposite)}
                        >
                            <Cell key="name" className={cx('Name')}>
                                {group}
                            </Cell>
                        </SortableRow>
                    ))}
                </SortableRowGroup>
            </Table>
        </LoadingContent>
    );
}

function SortableRowGroup({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div role="rowgroup" className={cx(className, 'SortableRowGroup')} {...props}>
            {children}
        </div>
    );
}

interface SortableRowProps extends RowProps {
    active?: boolean;
    onStart?: (element: HTMLDivElement | null) => void;
    onStop?: () => void;
    onMove?: (offset: { x?: number; y?: number }) => void;
    onOverlap?: (element: HTMLDivElement | null) => void;
}

function SortableRow({
    active,
    onStart,
    onStop,
    onMove,
    onOverlap,
    className,
    style,
    children,
    ...props
}: SortableRowProps) {
    const [overlapElement, setOverlapElement] = useState<HTMLDivElement | null>(null);
    const overlapPrevious = usePreviousValue(overlapElement);
    useEffect(() => {
        if (overlapElement && overlapPrevious !== overlapElement) {
            onOverlap?.(overlapElement);
        }
    }, [onOverlap, overlapElement, overlapPrevious]);

    const [dragging, setDragging] = useState(false);
    const [horizontalPosition, setHorizontalPosition] = useState<number | undefined>();
    if (!active && horizontalPosition) {
        setHorizontalPosition(undefined);
    }

    const [verticalPosition, setVerticalPosition] = useState<number | undefined>();
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const ref = useRef<HTMLDivElement>(null);

    const handleRef = useRef<HTMLDivElement>(null);
    const handleDragStart = useCallback(
        ({ target }: DraggableEvent, data: DraggableData) => {
            setVertical(handleRef.current === target || handleRef.current?.contains(target as Node));
            setStart({ x: data.x, y: data.y });
            const x = data.node.offsetLeft - data.x + (horizontalPosition ?? 0);
            const y = data.node.offsetTop - data.y + (verticalPosition ?? 0);
            if (offset.x !== x || offset.y !== y) {
                setOffset({ x, y });
            }
            onStart?.(ref.current);
        },
        [offset, onStart, horizontalPosition, verticalPosition]
    );

    const controlRef = useRef<HTMLDivElement>(null);
    const handleHorizontalDrag = useCallback(
        (_e: DraggableEvent, data: DraggableData) => {
            const x = data.x + offset.x;
            let newPosition: number | undefined = x - data.node.offsetLeft;
            const width = controlRef.current?.offsetWidth ?? data.node.offsetWidth / 2;
            if (-newPosition > width) {
                newPosition = -width;
            } else if (newPosition >= 0) {
                newPosition = undefined;
            }
            if (horizontalPosition !== newPosition) {
                setHorizontalPosition(newPosition);
            }
        },
        [horizontalPosition, offset.x]
    );

    const handleHorizontalDragEnd = useCallback(() => {
        if (horizontalPosition != null) {
            const width = controlRef.current?.offsetWidth ?? 0;
            const startPosition = start.x + offset.x;
            let newPosition: number | undefined;
            if (-horizontalPosition >= width * 0.75) {
                newPosition = -width;
            } else if (-horizontalPosition < width * 0.25) {
                newPosition = undefined;
            } else if (startPosition > horizontalPosition) {
                newPosition = -width;
            } else {
                newPosition = undefined;
            }
            if (horizontalPosition !== newPosition) {
                setHorizontalPosition(newPosition);
                onMove?.({ x: newPosition, y: verticalPosition });
            }
        }
    }, [horizontalPosition, offset.x, onMove, start.x, verticalPosition]);

    const handleVerticalDrag = useCallback(
        (_e: DraggableEvent, data: DraggableData) => {
            const bottom = (data.node.offsetParent as HTMLElement)?.offsetHeight;
            let y = data.y + offset.y;
            if (y <= 0) {
                y = 0;
            } else if (bottom) {
                const height = bottom - data.node.offsetHeight;
                if (y >= height) {
                    y = height;
                }
            }

            let newPosition = y - data.node.offsetTop;

            const element = getOverlappingElement<HTMLDivElement>(data.node);
            if (element !== overlapElement) {
                setOverlapElement(element);
                if (element) {
                    newPosition = y - element?.offsetTop;
                }
            }

            if (verticalPosition !== newPosition) {
                setVerticalPosition(newPosition);
                onMove?.({ x: horizontalPosition, y: newPosition });
            }
        },
        [horizontalPosition, offset.y, onMove, overlapElement, verticalPosition]
    );

    const handleVerticalDragEnd = useCallback(() => {
        if (verticalPosition != null) {
            setVerticalPosition(undefined);
            onMove?.({ x: horizontalPosition, y: undefined });
        }
    }, [horizontalPosition, onMove, verticalPosition]);

    const [vertical, setVertical] = useState<boolean>();
    const dragThreshold = 8;

    const handleDrag = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const v = Math.abs(data.y - start.y);
            const h = Math.abs(data.x - start.x);
            if (!dragging) {
                if (v < dragThreshold && h < dragThreshold) {
                    return;
                }
                setDragging(true);
            }
            if (vertical) {
                handleVerticalDrag(e, data);
            } else {
                handleHorizontalDrag(e, data);
            }
        },
        [handleHorizontalDrag, handleVerticalDrag, start, vertical, dragging]
    );

    const handleDragEnd = useCallback(() => {
        setDragging(false);
        setVertical(undefined);
        handleVerticalDragEnd();
        handleHorizontalDragEnd();
        onStop?.();
    }, [onStop, handleVerticalDragEnd, handleHorizontalDragEnd]);

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
                className={cx(className, { 'mod-dragging': dragging && vertical })}
                style={{
                    ...style,
                    ...(verticalPosition ? { transform: `translate(0, ${verticalPosition}px)` } : {}),
                }}
            >
                <div ref={handleRef} className={cx('DragHandle')}>
                    <DragHandleIcon />
                </div>

                {children}

                {active && (
                    <div
                        ref={controlRef}
                        className={cx('Controls')}
                        style={{ transform: horizontalPosition && `translate(${horizontalPosition}px, 0)` }}
                    >
                        <ButtonGroup align="right">
                            <Button color="primary" startDecorator={<EditIcon />}>
                                <Label>Edit</Label>
                            </Button>
                            <Button color="negative" startDecorator={<DeleteIcon />}>
                                <Label>Remove</Label>
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
            </Row>
        </DraggableCore>
    );
}

function getOverlappingElement<T extends HTMLElement>(element: HTMLElement | null, overlapSize = 0.4): T | null {
    if (element) {
        const rect = element.getBoundingClientRect();
        const parent = element.offsetParent as HTMLElement | null;
        if (parent) {
            for (const child of parent.children as HTMLCollectionOf<HTMLElement>) {
                if (child === element) {
                    continue;
                }
                const childRect = child.getBoundingClientRect();
                if (
                    (childRect.top >= rect.top && childRect.top <= rect.top + rect.height * overlapSize) ||
                    (rect.top >= childRect.top && rect.top <= childRect.top + childRect.height * overlapSize)
                ) {
                    return child as T;
                }
            }
        }
    }
    return null;
}
