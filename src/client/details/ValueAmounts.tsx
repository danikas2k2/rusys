import React from 'react';
import { ValueVariant } from '~/client/common/ValueVariant';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import { type VariantAmount } from '~/types/data';
import cx from './ValueAmounts.pcss';

export interface ValueAmountsProps {
    className?: string;
    group: string;
    amounts?: ReadonlyArray<VariantAmount>;
}

export function ValueAmounts({ className, group, amounts }: ValueAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    return (
        <div className={cx('ValueAmounts', className)}>
            {[...(amounts ?? [])]
                .sort((a, b) => compareVariants(a.variant, b.variant))
                .map((v) => (
                    <span className={cx('value')} key={v.variant}>
                        {v.amount}
                        <sub>
                            <ValueVariant group={group} variant={v.variant} />
                        </sub>
                    </span>
                ))}
        </div>
    );
}
