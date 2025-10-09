import React, { useCallback, useEffect } from 'react';

import { ActiveRowWrapper } from '~/client/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/common/ActiveRowOutsideClick';
import { useSortedList } from '~/client/common/hooks/useSortedList';
import { LoadingContent } from '~/client/common/LoadingContent';
import { ActiveDetailsBox } from '~/client/details/ActiveDetailsBox';
import { DetailsGroups } from '~/client/details/DetailsGroups';
import { useDetailsHasData } from '~/client/details/hooks/useDetailsHasData';
import { useMissingDetails } from '~/client/details/hooks/useMissingDetails';
import { MissingOnlyCheckbox } from '~/client/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/details/MissingOnlyContext';
import { useDetailsFilters } from '~/client/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
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
                <ActiveRowWrapper>
                    <ActiveRowOutsideClick />
                    <DetailsGroups groups={visibleGroups} details={visibleDetails} />
                    <ActiveDetailsBox />
                </ActiveRowWrapper>
            </Table>
        </LoadingContent>
    );
}
