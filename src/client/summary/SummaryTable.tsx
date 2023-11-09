import Loader from '@ui/Loader';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import InteractiveName from '~/client/InteractiveName';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import Table from '~/client/table/Table';
import { cmp } from '~/client/utils/cmp';
import { matchParts } from '~/client/utils/matchParts';
import ValueVariant from '~/client/ValueVariant';
import { type BaseState } from '~/store/base/types';
import { type Amounts, type Variant } from '~/store/details/types';
import useVariantComparator from '~/store/details/useVariantComparator';
import useSummaryLoader from '~/store/summary/useSummaryLoader';
import { type Name } from '~/store/types';
import './SummaryTable.less';

export default memo(function SummaryTable() {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const initialLoad = useSummaryLoader();
    useEffect(() => {
        (async () => {
            if (!loading && !loaded) {
                setLoading(true);
                await initialLoad();
                setLoaded(true);
                setLoading(false);
            }
        })();
    }, [loading, loaded, initialLoad]);

    const [years, stats, filter] = useSelector(
        (state: BaseState) => [state.years, state.statistics, state.filter] as const,
        isEqual
    );
    const statsEntries: [Name, Amounts][] = useMemo(
        () => Object.entries(stats).sort(([a], [b]) => cmp(a.toLowerCase(), b.toLowerCase())),
        [stats]
    );

    const filteredEntries = statsEntries.filter(([name]) => matchParts(name, filter));
    const cmpVariants = useVariantComparator();

    if (!years?.length && !stats?.length) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    return (
        <Table
            className="Table"
            header={
                <Row className="Row HeadRow">
                    <Cell />
                    {years.map((year) => (
                        <Cell key={year} className="year">
                            <sup>{year}</sup>/<sub>{year + 1}</sub>
                        </Cell>
                    ))}
                </Row>
            }
        >
            {filteredEntries.map(([name, values]) => (
                <Row key={name} className="Row">
                    <Cell className="name">
                        <InteractiveName name={name} />
                    </Cell>
                    {years.map((year) => (
                        <Cell key={year} className={classNames('ValueCell', { empty: isEmpty(values[year]) })}>
                            {Object.entries(values[year] ?? {})
                                .sort(([a], [b]) => cmpVariants(a, b))
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
        </Table>
    );
}, isEqual);
