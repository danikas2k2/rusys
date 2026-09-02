import React from 'react';

import { ExpiryStatusRow } from '~/client/common/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/common/VariantValueSpans';
import type { VariantAmount } from '~/common/data';
import { orderedExpiryBuckets, partitionByExpiryStatus } from '~/common/utils/expiry';

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
