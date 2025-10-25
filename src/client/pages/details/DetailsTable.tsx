import React, { useCallback, useEffect } from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { ActiveContentOutsideClick } from '~/client/common/ActiveContentOutsideClick';
import { useSortedList } from '~/client/common/hooks/useSortedList';
import { LoadingContent } from '~/client/common/LoadingContent';
import { useDetailsFilters } from '~/client/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { ActiveDetailsBox } from '~/client/pages/details/ActiveDetailsBox';
import { DetailsGroups } from '~/client/pages/details/DetailsGroups';
import { useDetailsHasData } from '~/client/pages/details/hooks/useDetailsHasData';
import { useMissingDetails } from '~/client/pages/details/hooks/useMissingDetails';
import { MissingOnlyCheckbox } from '~/client/pages/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/details/MissingOnlyContext';
import { useDetails } from '~/client/state/details/useDetails';
import { useGetDetails } from '~/client/state/details/useGetDetails';
import { useYears } from '~/client/state/years/useYears';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import cx from './DetailsTable.pcss';

export function DetailsTable() {
    const filteredDetails = useFilteredList(useDetails(), useDetailsFilters());
    const hasFilteredDetails = !!filteredDetails.length;

    const [missingOnly, setMissingOnly] = useMissingOnly();
    const missingDetails = useMissingDetails(filteredDetails);
    const hasMissingDetails = !!missingDetails.length;

    useEffect(() => {
        if (missingOnly && !hasMissingDetails && hasFilteredDetails) {
            setMissingOnly(false);
        }
    }, [hasFilteredDetails, hasMissingDetails, missingOnly, setMissingOnly]);

    const [filter, setFilter] = useQuickFilterContext();
    const handleClick = useCallback(() => {
        if (missingOnly && filter && !hasMissingDetails) {
            setFilter('');
        }
    }, [filter, hasMissingDetails, missingOnly, setFilter]);

    const visibleDetails = useSortedList(missingOnly ? missingDetails : filteredDetails);
    const uniqueGroups = useUniqueGroups(visibleDetails);
    const group = useGroupFilter();
    const visibleGroups = group ? [group] : uniqueGroups;

    return (
        <LoadingContent loader={useGetDetails()} hasData={useDetailsHasData()}>
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell role="columnheader">
                            <MissingOnlyCheckbox onClick={handleClick} />
                        </Cell>
                        <Cell role="columnheader" />
                        {useYears().map((year) => (
                            <Cell key={year} role="columnheader">
                                {year}
                            </Cell>
                        ))}
                    </Row>
                }
            >
                <ActiveContentWrapper>
                    <ActiveContentOutsideClick />
                    <DetailsGroups groups={visibleGroups} details={visibleDetails} />
                    <ActiveDetailsBox />
                </ActiveContentWrapper>
            </Table>
        </LoadingContent>
    );
}
