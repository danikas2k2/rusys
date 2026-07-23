import React from 'react';

import { DetailedAmounts } from '~/client/pages/products/DetailedAmounts';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';
import { formatVolume, formatWeight, getAmountTotals } from '~/common/utils/amounts';
import type { VariantAmount } from '~/types/data';

export interface TotalAmountsProps {
    group: string;
    amounts: readonly VariantAmount[];
}

export function TotalAmounts({ group, amounts }: TotalAmountsProps) {
    const variants = useVariantsByGroup(group);
    const { volume, weight, count, unitless } = getAmountTotals(amounts, variants);

    const formattedVolume = volume != null ? formatVolume(volume) : undefined;
    const formattedWeight = weight != null ? formatWeight(weight) : undefined;

    return (
        <>
            {formattedVolume && (
                <span data-value data-total="volume">
                    <span data-number>{formattedVolume.value}</span>
                    <sub>{formattedVolume.unit}</sub>
                </span>
            )}
            {formattedWeight && (
                <span data-value data-total="weight">
                    <span data-number>{formattedWeight.value}</span>
                    <sub>{formattedWeight.unit}</sub>
                </span>
            )}
            {count != null && (
                <span data-value data-total="count">
                    <span data-number>{count}</span>
                </span>
            )}
            {unitless.length > 0 && <DetailedAmounts group={group} amounts={unitless} />}
        </>
    );
}
