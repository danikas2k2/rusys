import React, { useCallback, useEffect } from 'react';

import { ActiveRowWrapper } from '~/client/app/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/app/common/ActiveRowOutsideClick';
import { useSortedList } from '~/client/app/common/hooks/useSortedList';
import { LoadingContent } from '~/client/app/common/LoadingContent';
import { ActiveDetailsBox } from '~/client/app/details/ActiveDetailsBox';
import { DetailsGroups } from '~/client/app/details/DetailsGroups';
import { useDetailsHasData } from '~/client/app/details/hooks/useDetailsHasData';
import { useMissingDetails } from '~/client/app/details/hooks/useMissingDetails';
import { MissingOnlyCheckbox } from '~/client/app/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/app/details/MissingOnlyContext';
import { useDetailsFilters } from '~/client/app/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/app/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/app/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/app/filters/QuickFilterContext';
import { useUniqueGroups } from '~/client/app/hooks/useUniqueGroups';
import { Cell } from '~/client/app/table/Cell';
import { Row } from '~/client/app/table/Row';
import { Table } from '~/client/app/table/Table';
import { useDetails } from '~/client/state/details/useDetails';
import { useGetDetails } from '~/client/state/details/useGetDetails';
import { useYears } from '~/client/state/years/useYears';
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
