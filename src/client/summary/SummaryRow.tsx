import React from 'react';
import { InteractiveName } from '~/client/InteractiveName';
import { SummaryCell } from '~/client/summary/SummaryCell';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import type { YearAmounts } from '~/common/types';
import { useYears } from '~/state/years/useYears';
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
    const years = useYears();
    return (
        <Row className={cx('Row')}>
            <Cell className={cx('name')}>
                <InteractiveName name={name} />
            </Cell>
            {years.map((year) => (
                <SummaryCell key={year} group={group} amounts={amounts?.find((y) => y.year === year)?.amounts} />
            ))}
        </Row>
    );
}
