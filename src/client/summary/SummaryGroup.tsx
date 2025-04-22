import React from 'react';
import { useRecycled } from '~/client/common/RecycledContext';
import { SummaryRow } from '~/client/summary/SummaryRow';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { type Summary } from '~/common/types';
import cx from './SummaryGroup.less';

interface SummaryGroupProps {
    group: string;
    summary: ReadonlyArray<Summary>;
}

export function SummaryGroup({ group, summary }: SummaryGroupProps) {
    const [recycled] = useRecycled();
    return (
        <div role="rowgroup">
            <Row className={cx('Row', 'GroupRow', { recycled })}>
                <Cell role="rowheader" className={cx('GroupHeading')}>
                    {group}
                </Cell>
            </Row>
            {summary.map(({ name, years }) => (
                <SummaryRow key={name} group={group} name={name} amounts={years} />
            ))}
        </div>
    );
}
