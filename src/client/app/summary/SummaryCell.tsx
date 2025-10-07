import React from 'react';

import { ValueSuffix } from '~/client/app/common/ValueSuffix';
import { Cell } from '~/client/app/table/Cell';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { type VariantAmount } from '~/types/data';
import cx from './SummaryCell.pcss';

export function SummaryCell({ group, amounts }: { group: string; amounts?: ReadonlyArray<VariantAmount> }) {
    const compareVariants = useGroupVariantComparator(group);
    const empty = !amounts?.length;
    return (
        <Cell className={cx('Cell', { empty })}>
            {empty
                ? '.'
                : [...amounts]
                      .sort((a, b) => compareVariants(a.variant, b.variant))
                      .map((v) => (
                          <span className={cx('value')} key={v.variant}>
                              {v.amount}
                              <ValueSuffix group={group} variant={v.variant} />
                          </span>
                      ))}
        </Cell>
    );
}
