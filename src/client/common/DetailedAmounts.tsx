import React from 'react';

import { ExpiryStatusRow } from '~/client/common/ExpiryStatusRow';
import { VariantValueSpans } from '~/client/common/VariantValueSpans';
import { orderedExpiryBuckets, partitionByExpiryStatus } from '~/common/utils/expiry';
import type { VariantAmount } from '~/types/data';

export function DetailedAmounts({ group, amounts }: { group: string; amounts: readonly VariantAmount[] }) {
    const buckets = partitionByExpiryStatus(amounts, new Date().getTime());
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
