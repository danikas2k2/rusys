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
import { useGroup } from '~/state/group/useGroup';
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGroups } from '~/state/groups/useGroups';
import { useGetSummary } from '~/state/summary/useGetSummary';
import { useSummary } from '~/state/summary/useSummary';
import { useGetVariants } from '~/state/variants/useGetVariants';
import { useVariants } from '~/state/variants/useVariants';
import { useYears } from '~/state/years/useYears';
import cx from './SummaryTable.less';

export function SummaryTable() {
    // TODO: optimize getSummary loader to load only necessary data
    const getSummary = useGetSummary();
    const getVariants = useGetVariants();
    const getGroups = useGetGroups();

    const group = useGroup();
    const filter = useFilter();
    const summary = useSummary();
    const filteredSummary = useMemo(
        () =>
            summary
                .filter((v) => (!group || v.group === group) && (!filter || matchParts(v.name, filter)))
                .sort((a, b) => compareGroups(a.group, b.group) || compareNames(a.name, b.name)),
        [summary, filter, group]
    );
    const uniqueGroups = useUniqueGroups(filteredSummary);
    const visibleGroups = group ? [group] : uniqueGroups;

    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    return (
        <LoadingContent
            loader={() => Promise.all([getSummary(), getGroups(), getVariants()])}
            hasData={!isEmpty(years) && !isEmpty(summary) && !isEmpty(groups) && !isEmpty(variants)}
        >
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
                {visibleGroups.map((g) => (
                    <div key={g} role="rowgroup">
                        <Row className={cx('Row', 'GroupRow')}>
                            <Cell role="rowheader" className={cx('GroupHeading')}>
                                {g}
                            </Cell>
                        </Row>
                        {filteredSummary
                            .filter((v) => v.group === g)
                            .map((v) => (
                                <SummaryRow key={v.name} group={v.group} name={v.name} amounts={v.years} />
                            ))}
                    </div>
                ))}
            </Table>
        </LoadingContent>
    );
}
