import React from 'react';

import { ExpiryStatusRow } from '~/client/pages/products/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/pages/products/VariantValueSpans';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';
import { formatVolume, formatWeight, getAmountTotals } from '~/common/utils/amounts';
import { orderedExpiryBuckets, partitionByExpiryStatus, type ExpiryStatus } from '~/common/utils/expiry';
import type { Variant, VariantAmount } from '~/types/data';

export interface TotalAmountsProps {
    group: string;
    amounts: readonly VariantAmount[];
}

function renderRow(
    group: string,
    amounts: readonly VariantAmount[],
    variants: readonly Variant[],
    status: ExpiryStatus | undefined
) {
    if (!amounts.length) {
        return null;
    }
    const { volume, weight, count, unitless } = getAmountTotals(amounts, variants);
    const formattedVolume = volume != null ? formatVolume(volume) : undefined;
    const formattedWeight = weight != null ? formatWeight(weight) : undefined;

    return (
        <ExpiryStatusRow key={status ?? 'valid'} status={status}>
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
            {unitless.length > 0 && <VariantValueSpans group={group} amounts={unitless} />}
        </ExpiryStatusRow>
    );
}

export function TotalAmounts({ group, amounts }: TotalAmountsProps) {
    const variants = useVariantsByGroup(group);
    const now = new Date().getTime();
    const buckets = partitionByExpiryStatus(amounts, now);

    return (
        <span data-amounts-rows>
            {orderedExpiryBuckets(buckets).map(([status, bucketAmounts]) =>
                renderRow(group, bucketAmounts, variants, status)
            )}
        </span>
    );
}
