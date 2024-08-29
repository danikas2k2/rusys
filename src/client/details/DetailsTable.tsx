import { Checkbox } from '@ui/Checkbox';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailsGroups } from '~/client/details/DetailsGroups';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { Cell } from '~/client/table/Cell';
import { LoadingContent } from '~/client/table/LoadingContent';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { compareGroups } from '~/client/utils/compareGroups';
import { compareNames } from '~/client/utils/compareNames';
import { matchParts } from '~/client/utils/matchParts';
import { useDetails } from '~/state/details/useDetails';
import { useGetDetails } from '~/state/details/useGetDetails';
import { useHasMissing } from '~/state/details/useHasMissing';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGroups } from '~/state/groups/useGroups';
import { useGetVariants } from '~/state/variants/useGetVariants';
import { useVariants } from '~/state/variants/useVariants';
import { useYears } from '~/state/years/useYears';
import cx from './DetailsTable.less';

// TODO add obvious header to see if details or summary table displayed
// TODO add control for quick switch between details and summary
export function DetailsTable() {
    // TODO: optimize getDetails loader to load only necessary data
    const getDetails = useGetDetails();
    const getVariants = useGetVariants();
    const getGroups = useGetGroups();

    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useState<boolean>(false);
    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    const details = useDetails();
    const missingDetails = useMemo(() => details.filter((v) => !missingOnly || v.missing), [details, missingOnly]);

    const group = useGroup();
    const filter = useFilter();
    const filteredDetails = useMemo(
        () => details.filter((v) => (!group || v.group === group) && (!filter || matchParts(v.name, filter))),
        [details, filter, group]
    );

    const filteredMissing = useMemo(
        () => missingDetails.filter((v) => matchParts(v.name, filter)),
        [filter, missingDetails]
    );

    useEffect(() => {
        if (missingOnly && !filteredMissing.length && filteredDetails.length) {
            setMissingOnly(false);
        }
    }, [filteredDetails.length, filteredMissing.length, missingOnly]);

    const clearFilter = useClearFilter();
    const onMissingOnlyClick = useCallback(() => {
        if (hasMissing) {
            setMissingOnly(!missingOnly);
            if (!filteredMissing.some((v) => v.missing)) {
                clearFilter();
            }
        }
    }, [clearFilter, filteredMissing, hasMissing, missingOnly]);

    const visibleDetails = useMemo(
        () =>
            (missingOnly ? filteredMissing : filteredDetails).sort(
                (a, b) => compareGroups(a.group, b.group) || compareNames(a.name, b.name)
            ),
        [filteredDetails, filteredMissing, missingOnly]
    );
    const uniqueGroups = useUniqueGroups(visibleDetails);
    const visibleGroups = group ? [group] : uniqueGroups;

    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    return (
        <LoadingContent
            loader={() => Promise.all([getDetails(), getGroups(), getVariants()])}
            hasData={!isEmpty(years) && !isEmpty(details) && !isEmpty(groups) && !isEmpty(variants)}
        >
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell role="columnheader">
                            <Checkbox
                                color="primary"
                                checked={!missingOnly}
                                disabled={!hasMissing}
                                onClick={onMissingOnlyClick}
                            />
                        </Cell>
                        <Cell role="columnheader" />
                        {years.map((year) => (
                            <Cell key={year} role="columnheader">
                                {year}
                            </Cell>
                        ))}
                    </Row>
                }
            >
                <DetailsGroups groups={visibleGroups} details={visibleDetails} />
            </Table>
        </LoadingContent>
    );
}
