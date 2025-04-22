import React from 'react';
import { ValueVariant } from '~/client/common/ValueVariant';
import { type VariantAmount } from '~/common/types';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import cx from './ValueAmounts.less';

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
