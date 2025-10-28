import React from 'react';

import { Table } from '@mantine/core';

import { ValueSuffix } from '~/client/common/ValueSuffix';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';
import cx from './SummaryCell.pcss';

export function SummaryCell({ group, amounts }: { group: string; amounts?: readonly VariantAmount[] }) {
    const compareVariants = useGroupVariantComparator(group);
    const empty = !amounts?.length;
    return (
        <Table.Td className={cx('data')} data-empty={empty}>
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
        </Table.Td>
    );
}
