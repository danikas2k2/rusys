import React from 'react';

import type { VariantAmount } from '~/common/data';
import { orderedExpiryBuckets, partitionByExpiryStatus } from '~/common/utils/expiry';
import { ExpiryStatusRow } from '~/components/amounts/ExpiryStatusRow';
import { VariantValueSpans } from '~/components/amounts/VariantValueSpans';

export function DetailedAmounts({
    group,
    amounts,
    expiryToleranceDays = 0,
}: {
    group: string;
    amounts: readonly VariantAmount[];
    expiryToleranceDays?: number;
}) {
    const buckets = partitionByExpiryStatus(amounts, new Date().getTime(), expiryToleranceDays);
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
