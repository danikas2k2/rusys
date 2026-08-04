import React from 'react';

import { ExpiryStatusRow } from '~/client/pages/products/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/pages/products/VariantValueSpans';
import { orderedExpiryBuckets, partitionByExpiryStatus } from '~/common/utils/expiry';
import type { VariantAmount } from '~/types/data';

export interface DetailedAmountsProps {
    group: string;
    amounts: readonly VariantAmount[];
}

export function DetailedAmounts({ group, amounts }: DetailedAmountsProps) {
    const now = new Date().getTime();
    const buckets = partitionByExpiryStatus(amounts, now);

    return (
        <span data-amounts-rows>
            {orderedExpiryBuckets(buckets).map(
                ([status, bucketAmounts]) =>
                    bucketAmounts.length > 0 && (
                        <ExpiryStatusRow key={status ?? 'valid'} status={status}>
                            <VariantValueSpans group={group} amounts={bucketAmounts} />
                        </ExpiryStatusRow>
                    )
            )}
        </span>
    );
}
