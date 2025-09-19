import React from 'react';

import { useSortedList } from '~/client/common/hooks/useSortedList';
import { LoadingContent } from '~/client/common/LoadingContent';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useDetailsFilters } from '~/client/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { useRecycledSummary } from '~/client/summary/hooks/useRecycledSummary';
import { useSummaryHasData } from '~/client/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/summary/hooks/useSummaryYears';
import { SummaryGroups } from '~/client/summary/SummaryGroups';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { useGetSummary } from '~/state/summary/useGetSummary';
import cx from './SummaryTable.pcss';

export function SummaryTable() {
    const visibleSummary = useSortedList(useFilteredList(useRecycledSummary(), useDetailsFilters()));
    const uniqueGroups = useUniqueGroups(visibleSummary);
    const group = useGroupFilter();
    const visibleGroups = group ? [group] : uniqueGroups;
    return (
        <LoadingContent loader={useGetSummary()} hasData={useSummaryHasData()}>
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell role="columnheader" className={cx('controls')}>
                            <UpdateTypeToggle updated={false} />
                        </Cell>
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
