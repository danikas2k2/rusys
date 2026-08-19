import { Text } from '@mantine/core';
import React from 'react';

import { ExpiryStatusRow } from '~/client/common/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/common/VariantValueSpans';
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

function Sources({ group, bucket }: { group: string; bucket: AmountTotalWithSources }) {
    return (
        <span data-sources>
            <Text c="dark" fz="sm" lh="xl">
                (
            </Text>
            <VariantValueSpans group={group} amounts={bucket.sources} />
            <Text c="dark" fz="sm" lh="xl">
                )
            </Text>
        </span>
    );
}

function isRedundantBreakdown(bucket: AmountTotalWithSources, displayedValue: string): boolean {
    return bucket.sources.length === 1 && String(bucket.sources[0].amount) === displayedValue;
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
                    {!isRedundantBreakdown(volume, formattedVolume.value) && <Sources group={group} bucket={volume} />}
                </span>
            )}
            {formattedWeight && weight && (
                <span data-value data-total="weight">
                    <span data-number>{formattedWeight.value}</span>
                    <sub>{formattedWeight.unit}</sub>
                    {!isRedundantBreakdown(weight, formattedWeight.value) && <Sources group={group} bucket={weight} />}
                </span>
            )}
            {count && (
                <span data-value data-total="count">
                    <span data-number>{count.total}</span>
                    {!isRedundantBreakdown(count, String(count.total)) && <Sources group={group} bucket={count} />}
                </span>
            )}
            {unitless.length > 0 && <VariantValueSpans group={group} amounts={unitless} />}
        </ExpiryStatusRow>
    );
}

export function AnnotatedTotalAmounts({ group, amounts }: { group: string; amounts: readonly VariantAmount[] }) {
    const variants = useVariantsByGroup(group);
    const buckets = partitionByExpiryStatus(amounts, new Date().getTime());
    return (
        <span data-amounts-rows data-annotated>
            {orderedExpiryBuckets(buckets).map(([status, bucketAmounts]) =>
                renderRow(group, bucketAmounts, variants, status)
            )}
        </span>
    );
}
