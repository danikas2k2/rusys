import type { VariantAmount } from '@rusys/common/data';
import { mergeAmountsIgnoringExpiry } from '@rusys/common/utils/amounts';
import React from 'react';

import { ApproxAmountIcon, HomeIcon, SuspiciousIcon } from '@icons';

import { AmountSuffix } from '~/components/amounts/AmountSuffix';
import { HOME_SUFFIX, SUSPICIOUS_SUFFIX } from '~/components/amounts/variantKeys';
import { useGroupVariantComparator } from '~/store/variants/useGroupVariantComparator';

export interface VariantValueSpansProps {
    group: string;
    amounts: readonly VariantAmount[];
}

export function VariantValueSpans({ group, amounts }: VariantValueSpansProps) {
    const compareVariants = useGroupVariantComparator(group);
    return (
        <>
            {mergeAmountsIgnoringExpiry(amounts)
                .slice()
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
