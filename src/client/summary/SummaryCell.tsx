import React from 'react';
import { ValueVariant } from '~/client/common/ValueVariant';
import { Cell } from '~/client/table/Cell';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import { type VariantAmount } from '~/types/data';
import cx from './SummaryCell.pcss';

export function SummaryCell({ group, amounts }: { group: string; amounts?: ReadonlyArray<VariantAmount> }) {
    const compareVariants = useGroupVariantComparator(group);
    return (
        <Cell
            className={cx('Cell', {
                empty: !amounts?.length,
            })}
        >
            {amounts &&
                [...amounts]
                    .sort((a, b) => compareVariants(a.variant, b.variant))
                    .map((v) => (
                        <span className={cx('value')} key={v.variant}>
                            {v.amount}
                            <sub>
                                <ValueVariant group={group} variant={v.variant} />
                            </sub>
                        </span>
                    ))}
        </Cell>
    );
}
