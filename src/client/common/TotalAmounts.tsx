import React from 'react';

import { ExpiryStatusRow } from '~/client/common/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/common/VariantValueSpans';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';
import type { Variant, VariantAmount } from '~/common/data';
import { formatVolume, formatWeight, getAmountTotals } from '~/common/utils/amounts';
import { orderedExpiryBuckets, partitionByExpiryStatus, type ExpiryStatus } from '~/common/utils/expiry';

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

export function TotalAmounts({
    group,
    amounts,
    expiryToleranceDays = 0,
}: {
    group: string;
    amounts: readonly VariantAmount[];
    expiryToleranceDays?: number;
}) {
    const variants = useVariantsByGroup(group);
    const buckets = partitionByExpiryStatus(amounts, new Date().getTime(), expiryToleranceDays);
    return (
        <span data-amounts-rows>
            {orderedExpiryBuckets(buckets).map(([status, bucketAmounts]) =>
                renderRow(group, bucketAmounts, variants, status)
            )}
        </span>
    );
}
