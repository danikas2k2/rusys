import React from 'react';

import { ApproxAmountIcon, HomeIcon, SuspiciousIcon } from '@icons';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { HOME_SUFFIX, SUSPICIOUS_SUFFIX } from '~/client/pages/products/utils/variantKeys';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';

export interface DetailedAmountsProps {
    group: string;
    amounts: readonly VariantAmount[];
}

export function DetailedAmounts({ group, amounts }: DetailedAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    return (
        <>
            {[...amounts]
                .sort(
                    (a, b) =>
                        compareVariants(a.variant, b.variant) ||
                        (!!a.suspicious === !!b.suspicious && !!a.home === !!b.home
                            ? 0
                            : a.suspicious || a.home
                              ? 1
                              : -1)
                )
                .map((v) => (
                    <span
                        key={`${v.variant}${v.suspicious ? SUSPICIOUS_SUFFIX : ''}${v.home ? HOME_SUFFIX : ''}`}
                        data-value
                        data-suspicious={v.suspicious || undefined}
                        data-home={v.home || undefined}
                    >
                        {v.home && <ApproxAmountIcon size=".75rem" style={{ alignSelf: 'center' }} />}
                        {v.amount}
                        <AmountSuffix group={group} variant={v.variant} />
                        {v.suspicious && <SuspiciousIcon size={12} />}
                        {v.home && <HomeIcon size={12} />}
                    </span>
                ))}
        </>
    );
}
