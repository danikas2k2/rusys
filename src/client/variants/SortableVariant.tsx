import cs from 'classnames';
import React, { useCallback, useRef } from 'react';
import { type ActiveRow, useActiveRow } from '~/client/common/ActiveRowContext';
import { Cell } from '~/client/table/Cell';
import { DragHandle } from '~/client/table/DragHandle';
import { SortableRow } from '~/client/table/SortableRow';
import { VariantControls } from '~/client/variants/VariantControls';
import { type Variant } from '~/common/types';
import cx from './SortableVariant.less';

export interface ActiveVariant extends ActiveRow, Pick<Variant, 'group' | 'variant'> {}

interface SortableVariantProps {
    className?: string;
    index: number;
    variant: Variant;
    onDragStart?: (variant: string) => void;
    onDragStop?: () => void;
    onDrag?: (current: HTMLDivElement) => void;
}

export function SortableVariant({
    className,
    index,
    variant: { group, variant, used, long, short },
    onDragStart,
    onDragStop,
    onDrag,
}: SortableVariantProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActiveVariant] = useActiveRow<ActiveVariant>();
    const isActive = active?.group === group && active?.variant === variant;
    const setActive = useCallback(() => setActiveVariant({ group, variant, ref }), [group, setActiveVariant, variant]);
    const setInactive = useCallback(() => setActiveVariant(undefined), [setActiveVariant]);
    const setPinned = useCallback(
        (pinned: boolean) => setActiveVariant(active && { ...active, pinned }),
        [active, setActiveVariant]
    );
    const onPin = useCallback(() => setPinned(true), [setPinned]);
    const onUnpin = useCallback((hide = false) => (hide ? setInactive() : setPinned(false)), [setInactive, setPinned]);

    const handleDragStart = useCallback(() => {
        if (!isActive) {
            setActive();
        }
        onDragStart?.(variant);
    }, [isActive, onDragStart, setActive, variant]);

    const handleDrag = useCallback(() => onDrag?.(ref.current!), [onDrag]);

    return (
        <SortableRow
            ref={ref}
            index={index}
            className={cs(className, cx('Row', { unused: !used }))}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={onDragStop}
            handle={<DragHandle onPointerDown={setInactive} />}
            controls={
                isActive ? (
                    <VariantControls group={group} variant={variant} onPin={onPin} onUnpin={onUnpin} />
                ) : undefined
            }
        >
            <Cell key="name" className={cx('Name')}>
                {variant}
            </Cell>
            <Cell key="long">{long}</Cell>
            <Cell key="short">{short}</Cell>
        </SortableRow>
    );
}
