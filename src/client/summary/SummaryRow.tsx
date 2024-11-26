import React from 'react';
import { useSummaryYears } from '~/client/summary/hooks/useSummaryYears';
import { SummaryCell } from '~/client/summary/SummaryCell';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import type { YearAmounts } from '~/common/types';
import cx from './SummaryRow.less';

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
