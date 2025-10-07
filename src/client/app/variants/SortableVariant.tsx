import React, { useCallback, useRef } from 'react';

import cs from 'classnames';

import { ActiveDragHandle } from '~/client/app/common/ActiveDragHandle';
import { useActiveRow, type ActiveRow } from '~/client/app/common/ActiveRowContext';
import { useErrorWrapper } from '~/client/app/common/hooks/useErrorWrapper';
import { SlideControls } from '~/client/app/common/SlideControls';
import { Cell } from '~/client/app/table/Cell';
import { SortableRow } from '~/client/app/table/SortableRow';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import { type Variant } from '~/types/data';
import cx from './SortableVariant.pcss';

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
    variant: { group, variant, used, suffix },
    onDragStart,
    onDragStop,
    onDrag,
}: SortableVariantProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActiveVariant] = useActiveRow<ActiveVariant>();
    const isActive = active?.group === group && active?.variant === variant;

    const handleDragStart = useCallback(() => {
        if (!isActive) {
            setActiveVariant({ group, variant, ref });
        }
        onDragStart?.(variant);
    }, [group, isActive, onDragStart, setActiveVariant, variant]);

    const handleDrag = useCallback(() => onDrag?.(ref.current!), [onDrag]);

    const deleteVariant = useDeleteVariant();
    const handleRemove = useErrorWrapper(() => deleteVariant(group, variant));

    return (
        <SortableRow
            ref={ref}
            index={index}
            className={cs(className, cx('Row', { unused: !used }))}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={onDragStop}
            handle={<ActiveDragHandle />}
            controls={isActive ? <SlideControls onRemove={handleRemove} /> : undefined}
        >
            <Cell key="name" className={cx('Name')}>
                {variant}
            </Cell>
            <Cell key="suffix">{suffix}</Cell>
        </SortableRow>
    );
}
