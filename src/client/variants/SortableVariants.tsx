import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cell } from '~/client/table/Cell';
import { DragHandle } from '~/client/table/DragHandle';
import { SortableRow } from '~/client/table/SortableRow';
import { getChangedIndexes } from '~/client/utils/getChangedIndexes';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { VariantControls } from '~/client/variants/VariantControls';
import { type Variant } from '~/common/types';
import { useReorderVariants } from '~/state/variants/useReorderVariants';
import cx from './SortableVariants.less';

interface SortableVariantsProps {
    group: string;
    variants: Variant[];
}

export function SortableVariants({ group, variants }: SortableVariantsProps) {
    const initialOrder = useMemo(() => variants.map((v) => v.variant), [variants]);
    const [variantOrder, setVariantOrder] = useState(initialOrder);
    useEffect(() => {
        setVariantOrder(initialOrder);
    }, [initialOrder]);

    const reorderVariants = useReorderVariants();
    const handleReorder = useCallback(
        (order: string[]) => reorderVariants(group, getChangedIndexes(initialOrder, order)),
        [group, initialOrder, reorderVariants]
    );

    const [activeVariant, setActiveVariant] = useState<string>();
    const setInactive = useCallback(() => setActiveVariant(undefined), []);

    const [pinned, setPinned] = useState(false);
    const onPin = useCallback(
        (hide = false) => {
            if (hide) {
                setInactive();
            }
            setPinned(true);
        },
        [setInactive]
    );
    const onUnpin = useCallback(
        (hide = false) => {
            if (hide) {
                setInactive();
            }
            setPinned(false);
        },
        [setInactive]
    );

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(pinned ? { current: null } : ref, setInactive);

    const onStart = useCallback(
        (variant: string) => {
            if (activeVariant !== variant) {
                setActiveVariant(variant);
            }
        },
        [activeVariant]
    );

    const onStop = useCallback(() => {
        if (!isEqual(variantOrder, initialOrder)) {
            void handleReorder(variantOrder);
        }
    }, [variantOrder, initialOrder, handleReorder]);

    const onMove = useCallback(() => {
        if (!activeVariant) {
            return;
        }
        const overlap = getOverlapIndex(ref.current);
        if (overlap >= 0) {
            const overlapVariant = variantOrder[overlap];
            if (overlapVariant && overlapVariant !== activeVariant) {
                const order = [...variantOrder];
                order[variantOrder.indexOf(activeVariant)] = overlapVariant;
                order[variantOrder.indexOf(overlapVariant)] = activeVariant;
                setVariantOrder(order);
            }
        }
    }, [activeVariant, variantOrder]);

    return (
        <div className={cx('SortableRows')}>
            {variantOrder.map((variant, i) => {
                const active = activeVariant === variant;
                const variantDetails = variants.find((v) => v.variant === variant);
                return (
                    <SortableRow
                        key={variant}
                        index={i}
                        ref={active ? ref : undefined}
                        className={cx('Row', { unused: !variantDetails?.used })}
                        onStart={() => onStart(variant)}
                        onStop={onStop}
                        onMove={onMove}
                        handle={<DragHandle onPointerDown={setInactive} />}
                        controls={
                            active ? (
                                <VariantControls group={group} variant={variant} onPin={onPin} onUnpin={onUnpin} />
                            ) : undefined
                        }
                    >
                        <Cell key="name" className={cx('Name')}>
                            {variant}
                        </Cell>
                        <Cell key="long">{variantDetails?.long}</Cell>
                        <Cell key="short">{variantDetails?.short}</Cell>
                    </SortableRow>
                );
            })}
        </div>
    );
}
