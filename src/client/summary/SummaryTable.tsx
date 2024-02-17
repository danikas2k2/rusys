import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { SummaryRow } from '~/client/summary/SummaryRow';
import { Cell } from '~/client/table/Cell';
import { LoadingContent } from '~/client/table/LoadingContent';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { compareGroups } from '~/client/utils/compareGroups';
import { compareNames } from '~/client/utils/compareNames';
import { matchParts } from '~/client/utils/matchParts';
import { useFilter } from '~/state/filter/useFilter';
import { useGetSummary } from '~/state/summary/useGetSummary';
import { useSummary } from '~/state/summary/useSummary';
import { useYears } from '~/state/years/useYears';
import cx from './SummaryTable.less';

export function SummaryTable() {
    const getSummary = useGetSummary();
    const filter = useFilter();
    const summary = useSummary();
    const filteredSummary = useMemo(
        () =>
            summary
                .filter((v) => matchParts(v.name, filter))
                .sort((a, b) => compareGroups(a.group, b.group) || compareNames(a.name, b.name)),
        [summary, filter]
    );
    const groups = useUniqueGroups(filteredSummary);
    const years = useYears();
    return (
        <LoadingContent loader={getSummary} hasData={!isEmpty(years) && !isEmpty(summary)}>
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell role="columnheader" />
                        {years.map((year) => (
                            <Cell key={year} role="columnheader" className={cx('year')}>
                                <sup>{year}</sup>/<sub>{year + 1}</sub>
                            </Cell>
                        ))}
                    </Row>
                }
            >
                {groups.map((group) => (
                    <div key={group} role="rowgroup">
                        <Row className={cx('Row', 'GroupRow')}>
                            <Cell role="rowheader" className={cx('GroupHeading')}>
                                {group}
                            </Cell>
                        </Row>
                        {filteredSummary
                            .filter((v) => v.group === group)
                            .map((v) => (
                                <SummaryRow key={v.name} group={group} name={v.name} amounts={v.years} />
                            ))}
                    </div>
                ))}
            </Table>
        </LoadingContent>
    );
}
