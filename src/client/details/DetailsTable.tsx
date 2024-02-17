import { Checkbox } from '@ui/Checkbox';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ValueRow } from '~/client/details/ValueRow';
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
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGetVariants } from '~/state/variants/useGetVariants';
import { useYears } from '~/state/years/useYears';
import cx from './DetailsTable.less';

export function DetailsTable() {
    const getDetails = useGetDetails();
    const getGroups = useGetGroups();
    const getVariants = useGetVariants();

    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useState<boolean>(false);
    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    const details = useDetails();
    const missingDetails = useMemo(() => details.filter((v) => !missingOnly || v.missing), [details, missingOnly]);

    const filter = useFilter();
    const filteredDetails = useMemo(() => details.filter((v) => matchParts(v.name, filter)), [details, filter]);

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
    const groups = useUniqueGroups(visibleDetails);
    const years = useYears();

    return (
        <LoadingContent
            loader={() => Promise.all([getDetails(), getGroups(), getVariants()])}
            hasData={!isEmpty(years) && !isEmpty(details)}
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
                {groups.map((group) => (
                    <div key={group} role="rowgroup">
                        <Row className={cx('Row', 'GroupRow')}>
                            <Cell role="rowheader" className={cx('GroupHeading')}>
                                {group}
                            </Cell>
                        </Row>
                        {visibleDetails
                            .filter((v) => v.group === group)
                            .map((v) => (
                                <ValueRow
                                    key={`${v.group}:${v.name}`}
                                    className={cx('Row')}
                                    group={group}
                                    name={v.name}
                                    amounts={v.years}
                                    missing={v.missing}
                                />
                            ))}
                    </div>
                ))}
            </Table>
        </LoadingContent>
    );
}
