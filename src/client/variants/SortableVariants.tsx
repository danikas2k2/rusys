import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { isEqual } from 'lodash';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { getChangedIndexes } from '~/client/utils/getChangedIndexes';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
import { SortableVariant, type ActiveVariant } from '~/client/variants/SortableVariant';
import { type Variant } from '~/types/data';
import cx from './SortableVariants.pcss';

interface SortableVariantsProps {
    className?: string;
    group: string;
    variants: Variant[];
}

export function SortableVariants({ className, group, variants }: SortableVariantsProps) {
    const initialOrder = useMemo(() => variants.map((v) => v.variant), [variants]);
    const [variantOrder, setVariantOrder] = useState(initialOrder);
    useEffect(() => {
        setVariantOrder(initialOrder);
    }, [initialOrder]);

    const reorderVariants = useReorderVariants();
    const handleReorder = useCallback(
        (order: string[]) => void reorderVariants(group, getChangedIndexes(initialOrder, order)),
        [group, initialOrder, reorderVariants]
    );

    const [active] = useActiveRow<ActiveVariant>();

    const handleDragStop = useCallback(() => {
        if (!isEqual(variantOrder, initialOrder)) {
            handleReorder(variantOrder);
        }
    }, [variantOrder, initialOrder, handleReorder]);

    const handleDrag = useCallback(
        (current: HTMLDivElement) => {
            if (active?.group === group) {
                const overlap = getOverlapIndex(current);
                if (overlap >= 0) {
                    const overlapVariant = variantOrder[overlap];
                    if (overlapVariant && overlapVariant !== active?.variant) {
                        const order = [...variantOrder];
                        order[variantOrder.indexOf(active?.variant)] = overlapVariant;
                        order[variantOrder.indexOf(overlapVariant)] = active?.variant;
                        setVariantOrder(order);
                    }
                }
            }
        },
        [active?.group, active?.variant, group, variantOrder]
    );

    return (
        <div className={cx('SortableRows')}>
            {variantOrder.map((variant, i) => {
                const variantDetails = variants.find((v) => v.variant === variant);
                return (
                    variantDetails && (
                        <SortableVariant
                            key={variant}
                            index={i}
                            variant={variantDetails}
                            className={className}
                            onDrag={handleDrag}
                            onDragStop={handleDragStop}
                        />
                    )
                );
            })}
        </div>
    );
}
