import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { isEqual } from 'lodash';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { SortableVariant } from '~/client/pages/variants/SortableVariant';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { getChangedIndexes } from '~/client/utils/getChangedIndexes';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';
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

    const [active] = useActiveContent<Pick<Variant, 'group' | 'variant'>>();

    const handleDragStop = useCallback(() => {
        if (!isEqual(variantOrder, initialOrder)) {
            handleReorder(variantOrder);
        }
    }, [variantOrder, initialOrder, handleReorder]);

    const handleDrag = useCallback(
        (current: HTMLDivElement) => {
            if (active?.data?.group === group) {
                const overlap = getOverlapIndex(current);
                if (overlap >= 0) {
                    const overlapVariant = variantOrder[overlap];
                    if (overlapVariant && overlapVariant !== active?.data?.variant) {
                        const order = [...variantOrder];
                        order[variantOrder.indexOf(active?.data?.variant)] = overlapVariant;
                        order[variantOrder.indexOf(overlapVariant)] = active?.data?.variant;
                        setVariantOrder(order);
                    }
                }
            }
        },
        [active?.data?.group, active?.data?.variant, group, variantOrder]
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
