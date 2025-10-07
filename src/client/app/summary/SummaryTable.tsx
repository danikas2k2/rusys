import React from 'react';

import { useSortedList } from '~/client/app/common/hooks/useSortedList';
import { LoadingContent } from '~/client/app/common/LoadingContent';
import { UpdateTypeToggle } from '~/client/app/common/UpdateTypeToggle';
import { useDetailsFilters } from '~/client/app/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/app/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/app/filters/hooks/useGroupFilter';
import { useUniqueGroups } from '~/client/app/hooks/useUniqueGroups';
import { useRecycledSummary } from '~/client/app/summary/hooks/useRecycledSummary';
import { useSummaryHasData } from '~/client/app/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/app/summary/hooks/useSummaryYears';
import { SummaryGroups } from '~/client/app/summary/SummaryGroups';
import { Cell } from '~/client/app/table/Cell';
import { Row } from '~/client/app/table/Row';
import { Table } from '~/client/app/table/Table';
import { useGetSummary } from '~/client/state/summary/useGetSummary';
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
