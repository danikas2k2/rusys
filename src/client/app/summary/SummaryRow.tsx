import React from 'react';

import { useSummaryYears } from '~/client/app/summary/hooks/useSummaryYears';
import { SummaryCell } from '~/client/app/summary/SummaryCell';
import { Cell } from '~/client/app/table/Cell';
import { Row } from '~/client/app/table/Row';
import { type YearAmounts } from '~/types/data';
import cx from './SummaryRow.pcss';

export function SummaryRow({
    group,
    name,
    amounts,
}: {
    group: string;
    name: string;
    amounts?: ReadonlyArray<YearAmounts>;
}) {
    return (
        <Row className={cx('Row')}>
            <Cell className={cx('name')}>{name}</Cell>
            {useSummaryYears().map((year) => (
                <SummaryCell key={year} group={group} amounts={amounts?.find((y) => y.year === year)?.amounts} />
            ))}
        </Row>
    );
}
