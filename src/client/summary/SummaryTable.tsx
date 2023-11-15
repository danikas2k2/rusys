import Loader from '@ui/Loader';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useMemo } from 'react';
import { Error } from '~/client/Error';
import InteractiveName from '~/client/InteractiveName';
import Label from '~/client/Label';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import Table from '~/client/table/Table';
import { filterGroupedEntries } from '~/client/utils/filterGroupedEntries';
import ValueVariant from '~/client/ValueVariant';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { type Amounts, type Variant } from '~/state/details/types';
import { useFilter } from '~/state/filter/useFilter';
import { useSummary } from '~/state/summary/useSummary';
import { useSummaryLoader } from '~/state/summary/useSummaryLoader';
import { type Group, type Name } from '~/state/types';
import { useVariantComparator } from '~/state/variants/useVariantComparator';
import { useYears } from '~/state/years/useYears';
import './SummaryTable.less';

export default memo(function SummaryTable() {
    const loader = useSummaryLoader();
    const loading = useLockingLoader(loader);

    const filter = useFilter();
    const summary = useSummary();
    const filteredEntries: [Group, [Name, Amounts][]][] = useMemo(
        () => filterGroupedEntries(summary, filter),
        [summary, filter]
    );

    const years = useYears();
    const compareVariants = useVariantComparator();

    if (loading === LoadingState.INITIAL || loading === LoadingState.LOADING) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (loading === LoadingState.FAILED) {
        return (
            <Error>
                <Label>Failed to load data</Label>
            </Error>
        );
    }

    if (isEmpty(years) || isEmpty(summary)) {
        return (
            <Error>
                <Label>No data</Label>
            </Error>
        );
    }

    return (
        <Table
            className="Table"
            header={
                <Row className="Row HeadRow">
                    <Cell role="columnheader" />
                    {years.map((year) => (
                        <Cell key={year} role="columnheader" className="year">
                            <sup>{year}</sup>/<sub>{year + 1}</sub>
                        </Cell>
                    ))}
                </Row>
            }
        >
            {filteredEntries.map(([group, namedValues]) => (
                <div key={group} role="rowgroup">
                    <Row className="Row GroupRow">
                        <Cell role="rowheader" className="GroupHeading">
                            {group}
                        </Cell>
                    </Row>
                    {namedValues.map(([name, values]) => (
                        <Row key={name} className="Row">
                            <Cell className="name">
                                <InteractiveName name={name} />
                            </Cell>
                            {years.map((year) => (
                                <Cell key={year} className={classNames('ValueCell', { empty: isEmpty(values[year]) })}>
                                    {Object.entries(values[year] ?? {})
                                        .sort(([a], [b]) => compareVariants(a, b))
                                        .map(([k, v]) => (
                                            <span className="value" key={k}>
                                                {v}
                                                <sub>
                                                    <ValueVariant variant={k as Variant} />
                                                </sub>
                                            </span>
                                        ))}
                                </Cell>
                            ))}
                        </Row>
                    ))}
                </div>
            ))}
        </Table>
    );
}, isEqual);
