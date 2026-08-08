import React from 'react';

import { ExpiryStatusRow } from '~/client/pages/products/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/pages/products/VariantValueSpans';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';
import {
    formatVolume,
    formatWeight,
    getAmountTotalsDetailed,
    type AmountTotalWithSources,
} from '~/common/utils/amounts';
import { orderedExpiryBuckets, partitionByExpiryStatus, type ExpiryStatus } from '~/common/utils/expiry';
import type { Variant, VariantAmount } from '~/types/data';

import './AnnotatedTotalAmounts.pcss';

export interface AnnotatedTotalAmountsProps {
    group: string;
    amounts: readonly VariantAmount[];
}

function Sources({ group, bucket }: { group: string; bucket: AmountTotalWithSources }) {
    return (
        <span data-sources>
            (<VariantValueSpans group={group} amounts={bucket.sources} />)
        </span>
    );
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
    const { volume, weight, count, unitless } = getAmountTotalsDetailed(amounts, variants);
    const formattedVolume = volume ? formatVolume(volume.total) : undefined;
    const formattedWeight = weight ? formatWeight(weight.total) : undefined;

    return (
        <ExpiryStatusRow key={status ?? 'valid'} status={status}>
            {formattedVolume && volume && (
                <span data-value data-total="volume">
                    <span data-number>{formattedVolume.value}</span>
                    <sub>{formattedVolume.unit}</sub>
                    <Sources group={group} bucket={volume} />
                </span>
            )}
            {formattedWeight && weight && (
                <span data-value data-total="weight">
                    <span data-number>{formattedWeight.value}</span>
                    <sub>{formattedWeight.unit}</sub>
                    <Sources group={group} bucket={weight} />
                </span>
            )}
            {count && (
                <span data-value data-total="count">
                    <span data-number>{count.total}</span>
                    <Sources group={group} bucket={count} />
                </span>
            )}
            {unitless.length > 0 && <VariantValueSpans group={group} amounts={unitless} />}
        </ExpiryStatusRow>
    );
}

export function AnnotatedTotalAmounts({ group, amounts }: AnnotatedTotalAmountsProps) {
    const variants = useVariantsByGroup(group);
    const now = new Date().getTime();
    const buckets = partitionByExpiryStatus(amounts, now);

    return (
        <span data-amounts-rows data-annotated>
            {orderedExpiryBuckets(buckets).map(([status, bucketAmounts]) =>
                renderRow(group, bucketAmounts, variants, status)
            )}
        </span>
    );
}
