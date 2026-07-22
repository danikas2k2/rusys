import { IconAlertTriangle, IconHome, IconTilde } from '@tabler/icons-react';
import React from 'react';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { HOME_SUFFIX, SUSPICIOUS_SUFFIX } from '~/client/pages/products/utils/variantKeys';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';

import './ProductAmounts.pcss';

export interface ProductAmountsProps {
    group: string;
    amounts?: readonly VariantAmount[];
    type?: 'common' | 'consumed' | 'recycled';
}

export function ProductAmounts({ group, amounts, type = 'common' }: ProductAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    return amounts?.length ? (
        <span data-type={type}>
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
                        {v.home && <IconTilde size=".75rem" style={{ alignSelf: 'center' }} />}
                        {v.amount}
                        <AmountSuffix group={group} variant={v.variant} />
                        {v.suspicious && <IconAlertTriangle size={12} />}
                        {v.home && <IconHome size={12} />}
                    </span>
                ))}
        </span>
    ) : null;
}
