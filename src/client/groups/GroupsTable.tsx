import { Button, ButtonGroup } from '@ui/Button';
import { isEmpty } from 'lodash';
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
import { Row, type RowProps } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { matchParts } from '~/client/utils/matchParts';
import { usePreviousValue } from '~/hooks/usePreviousValue';
import { useFilter } from '~/state/filter/useFilter';
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGroups } from '~/state/groups/useGroups';
import { useSwitchGroups } from '~/state/groups/useSwitchGroups';
import { LoadingContent } from '../table/LoadingContent';
import cx from './GroupsTable.less';

export function GroupsTable() {
    const getGroups = useGetGroups();

    const filter = useFilter();
    const groups = useGroups();
    const filteredGroups = useMemo(
        () => groups.filter((v) => matchParts(v.group, filter)).sort((a, b) => a.order - b.order),
        [groups, filter]
    );

    // TODO update remote order only on drag end
    const switchGroups = useSwitchGroups();
    const onOverlap = useCallback(
        async (group: string, opposite: HTMLElement) => {
            const overlapGroup = opposite.dataset.group;
            if (overlapGroup) {
                await switchGroups(group, overlapGroup);
            }
        },
        [switchGroups]
    );

    return (
        <LoadingContent loader={getGroups} hasData={!isEmpty(groups)}>
            <Table className={cx('Table')}>
                <DraggableRowGroup>
                    {filteredGroups.map((g) => (
                        <SortableRow
                            key={g.group}
                            data-group={g.group}
                            data-order={g.order}
                            className={cx('Row')}
                            onOverlap={(opposite) => onOverlap(g.group, opposite)}
                        >
                            <Cell key="name" className={cx('Name')}>
                                {g.group}
                            </Cell>
                        </SortableRow>
                    ))}
                </DraggableRowGroup>
            </Table>
        </LoadingContent>
    );
}

function DraggableRowGroup({ children, style, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div role="rowgroup" style={{ position: 'relative', ...style }} {...props}>
            {children}
        </div>
    );
}

function SortableRow({
    onOverlap,
    onStart,
    onStop,
    children,
    ...props
}: RowProps & {
    onOverlap?: (element: HTMLElement) => void;
    onStart?: () => void;
    onStop?: () => void;
}) {
    const [overlapElement, setOverlapElement] = useState<HTMLElement | null>(null);
    const overlapPrevious = usePreviousValue(overlapElement);
    useEffect(() => {
        if (overlapElement && overlapPrevious !== overlapElement) {
            onOverlap?.(overlapElement);
        }
    }, [onOverlap, overlapElement, overlapPrevious]);

    const [dragging, setDragging] = useState(false);
    const [horizontalPosition, setHorizontalPosition] = useState<number | undefined>();
    const [verticalPosition, setVerticalPosition] = useState<number | undefined>();
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const handleDragStart = useCallback(
        (_e: DraggableEvent, data: DraggableData) => {
            setDragging(true);
            setStart({ x: data.x, y: data.y });
            const x = data.node.offsetLeft - data.x + (horizontalPosition ?? 0);
            const y = data.node.offsetTop - data.y + (verticalPosition ?? 0);
            if (offset.x !== x || offset.y !== y) {
                setOffset({ x, y });
            }
            onStart?.();
        },
        [offset, onStart, horizontalPosition, verticalPosition]
    );

    const controlRef = useRef<HTMLDivElement>(null);
    const handleHorizontalDrag = useCallback(
        (_e: DraggableEvent, data: DraggableData) => {
            const right = (data.node.offsetParent as HTMLElement)?.offsetWidth;
            let x = data.x + offset.x;

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
        [offset, overlapElement, verticalPosition]
    );

    const handleHorizontalDragEnd = useCallback(() => {
        if (horizontalPosition != null) {
            const width = controlRef.current?.offsetWidth ?? 0;
            const startPosition = start.x + offset.x;

            if (-horizontalPosition >= width * 0.75) {
                setHorizontalPosition(-width);
            } else if (-horizontalPosition < width * 0.25) {
                setHorizontalPosition(undefined);
            } else if (startPosition > horizontalPosition) {
                setHorizontalPosition(-width);
            } else {
                setHorizontalPosition(undefined);
            }
        }
    }, [horizontalPosition]);

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

            const element = getOverlappingElement(data.node);
            if (element !== overlapElement) {
                setOverlapElement(element);
                if (element) {
                    newPosition = y - element?.offsetTop;
                }
            }

            if (verticalPosition !== newPosition) {
                setVerticalPosition(newPosition);
            }
        },
        [offset, overlapElement, verticalPosition]
    );

    const handleVerticalDragEnd = useCallback(() => {
        if (verticalPosition != null) {
            setVerticalPosition(undefined);
        }
    }, [verticalPosition]);

    const [vertical, setVertical] = useState<boolean>();
    const dragThreshold = 5;

    const handleDrag = useCallback(
        (e: DraggableEvent, data: DraggableData) => {
            const v = Math.abs(data.y - start.y);
            const h = Math.abs(data.x - start.x);
            if (v < dragThreshold && h < dragThreshold) {
                setVertical(undefined);
                return;
            }
            const current = vertical ?? v > h;
            if (vertical === undefined) {
                setVertical(current);
            }
            if (current) {
                handleVerticalDrag(e, data);
            } else {
                handleHorizontalDrag(e, data);
            }
        },
        [handleHorizontalDrag, handleVerticalDrag, start, vertical]
    );

    const handleDragEnd = useCallback(() => {
        setDragging(false);
        handleVerticalDragEnd();
        handleHorizontalDragEnd();
        onStop?.();
    }, [onStop, handleVerticalDragEnd, handleHorizontalDragEnd]);

    return (
        <DraggableCore onStart={handleDragStart} onStop={handleDragEnd} onDrag={handleDrag}>
            <Row
                {...props}
                className={cx(props.className, { 'mod-dragging': dragging })}
                style={verticalPosition ? { transform: `translate(0, ${verticalPosition}px)` } : {}}
            >
                {children}
                {horizontalPosition && (
                    <div
                        ref={controlRef}
                        className={cx('Controls')}
                        style={{
                            transform: `translate(${horizontalPosition ?? 0}px, 0)`,
                        }}
                    >
                        <ButtonGroup fullWidth>
                            <Button color="primary">
                                <Label>Edit</Label>
                            </Button>
                            <Button color="negative">
                                <Label>Remove</Label>
                            </Button>
                        </ButtonGroup>
                    </div>
                )}
            </Row>
        </DraggableCore>
    );
}

function getOverlappingElement(element: HTMLElement | null, overlapSize = 0.4): HTMLElement | null {
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
                    return child;
                }
            }
        }
    }
    return null;
}
