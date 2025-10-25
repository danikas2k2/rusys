import React, { useCallback, useRef } from 'react';

import cs from 'classnames';

import { useActiveContent, type ActiveContent } from '~/client/common/ActiveContentContext';
import { ActiveDragHandle } from '~/client/common/ActiveDragHandle';
import { useErrorWrapper } from '~/client/common/hooks/useErrorWrapper';
import { SwipePanel } from '~/client/common/SwipePanel';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import { Cell } from '~/client/table/Cell';
import { SortableRow } from '~/client/table/SortableRow';
import { type Variant } from '~/types/data';
import cx from './SortableVariant.pcss';

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
    const [active, setActive] = useActiveContent<Pick<Variant, 'group' | 'variant'>>();
    const isActive = active?.data?.group === group && active?.data?.variant === variant;

    const handleDragStart = useCallback(() => {
        if (!isActive) {
            setActive({ id: `${variant}@${group}`, data: { group, variant }, ref });
        }
        onDragStart?.(variant);
    }, [group, isActive, onDragStart, setActive, variant]);

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
            controls={isActive ? <SwipePanel onRemove={handleRemove} /> : undefined}
        >
            <Cell key="name" className={cx('Name')}>
                {variant}
            </Cell>
            <Cell key="suffix">{suffix}</Cell>
        </SortableRow>
    );
}
