import React from 'react';
import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { useSortedList } from '~/client/common/hooks/useSortedList';
import { LoadingContent } from '~/client/common/LoadingContent';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { useRecycledSummary } from '~/client/summary/hooks/useRecycledSummary';
import { useSummaryHasData } from '~/client/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/summary/hooks/useSummaryYears';
import { SummaryGroups } from '~/client/summary/SummaryGroups';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { useGroup } from '~/state/group/useGroup';
import { useGetSummary } from '~/state/summary/useGetSummary';
import cx from './SummaryTable.less';

export function SummaryTable() {
    const group = useGroup();
    const visibleSummary = useSortedList(useFilteredList(useRecycledSummary()));
    const uniqueGroups = useUniqueGroups(visibleSummary);
    const visibleGroups = group ? [group] : uniqueGroups;
    return (
        <LoadingContent loader={useGetSummary()} hasData={useSummaryHasData()}>
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell role="columnheader" />
                        {useSummaryYears().map((year) => (
                            <Cell key={year} role="columnheader" className={cx('year')}>
                                <sup>{year}</sup>/<sub>{year + 1}</sub>
                            </Cell>
                        ))}
                    </Row>
                }
            >
                <SummaryGroups groups={visibleGroups} summary={visibleSummary} />
            </Table>
        </LoadingContent>
    );
}
