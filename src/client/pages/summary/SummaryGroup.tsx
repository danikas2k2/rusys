import React from 'react';

import { UpdateTypes, useUpdateType } from '~/client/common/UpdateTypeContext';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { type Summary } from '~/types/data';
import cx from './SummaryGroup.pcss';

interface SummaryGroupProps {
    group: string;
    summary: ReadonlyArray<Summary>;
}

export function SummaryGroup({ group, summary }: SummaryGroupProps) {
    const [updateType] = useUpdateType();
    const recycled = updateType === UpdateTypes.Recycled;
    return (
        <div role="rowgroup">
            <Row className={cx('Row', 'GroupRow', { recycled })}>
                <Cell role="rowheader" className={cx('GroupHeading')}>
                    {group}
                </Cell>
            </Row>
            <div className={cx('GroupedRows')}>
                {summary.map(({ name, years }) => (
                    <SummaryRow key={name} group={group} name={name} amounts={years} />
                ))}
            </div>
        </div>
    );
}
