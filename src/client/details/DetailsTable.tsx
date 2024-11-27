import React, { useCallback, useEffect } from 'react';
import { ActiveRowContextWrapper } from '~/client/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/common/ActiveRowOutsideClick';
import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { useSortedList } from '~/client/common/hooks/useSortedList';
import { LoadingContent } from '~/client/common/LoadingContent';
import { DetailsGroups } from '~/client/details/DetailsGroups';
import { useDetailsHasData } from '~/client/details/hooks/useDetailsHasData';
import { useMissingDetails } from '~/client/details/hooks/useMissingDetails';
import { MissingOnlyCheckbox } from '~/client/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/details/MissingOnlyContext';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { useDetails } from '~/state/details/useDetails';
import { useGetDetails } from '~/state/details/useGetDetails';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';
import { useYears } from '~/state/years/useYears';
import cx from './DetailsTable.less';

export function DetailsTable() {
    const filteredDetails = useFilteredList(useDetails());
    const hasFilteredDetails = !!filteredDetails.length;

    const [missingOnly, setMissingOnly] = useMissingOnly();
    const missingDetails = useMissingDetails(filteredDetails);
    const hasMissingDetails = !!missingDetails.length;

    useEffect(() => {
        if (missingOnly && !hasMissingDetails && hasFilteredDetails) {
            setMissingOnly(false);
        }
    }, [hasFilteredDetails, hasMissingDetails, missingOnly, setMissingOnly]);

    const filter = useFilter();
    const clearFilter = useClearFilter();
    const handleClick = useCallback(() => {
        if (missingOnly && filter && !hasMissingDetails) {
            clearFilter();
        }
    }, [clearFilter, filter, hasMissingDetails, missingOnly]);

    const group = useGroup();
    const visibleDetails = useSortedList(missingOnly ? missingDetails : filteredDetails);
    const uniqueGroups = useUniqueGroups(visibleDetails);
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
                <ActiveRowContextWrapper>
                    <ActiveRowOutsideClick />
                    <DetailsGroups groups={visibleGroups} details={visibleDetails} />
                </ActiveRowContextWrapper>
            </Table>
        </LoadingContent>
    );
}
