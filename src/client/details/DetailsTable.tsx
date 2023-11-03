import Checkbox from '@ui/Checkbox';
import Loader from '@ui/Loader';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ValueRow from '~/client/details/ValueRow';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import Table from '~/client/table/Table';
import { cmp } from '~/client/utils/cmp';
import { matchParts } from '~/client/utils/matchParts';
import { type BaseState } from '~/store/base/types';
import useInitialLoader from '~/store/base/useInitialLoader';
import { type Amounts } from '~/store/details/types';
import { type Name } from '~/store/types';
import './DetailsTable.less';

export default memo(function DetailsTable() {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const initialLoad = useInitialLoader();
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

    const [missing, years, details, filter] = useSelector(
        (state: BaseState) => [state.missing, state.years, state.details, state.filter] as const,
        isEqual
    );
    const [missingOnly, setMissingOnly] = useState<boolean>(false);
    const hasMissing = !!missing.length;

    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    const handleClick = useCallback(() => hasMissing && setMissingOnly(!missingOnly), [hasMissing, missingOnly]);

    const detailsEntries: [Name, Amounts][] = useMemo(
        () => Object.entries(details).sort(([a], [b]) => cmp(a.toLowerCase(), b.toLowerCase())),
        [details]
    );

    const filteredEntries = detailsEntries.filter(([name]) => matchParts(name, filter));

    if (!years?.length && !details?.length) {
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
                    <Cell>
                        <Checkbox color="primary" checked={!missingOnly} disabled={!hasMissing} onClick={handleClick} />
                    </Cell>
                    <Cell />
                    {years.map((year) => (
                        <Cell key={year}>{year}</Cell>
                    ))}
                </Row>
            }
        >
            {filteredEntries.map(([name, values]) => {
                const isMissing = missing.includes(name);
                return (
                    (!missingOnly || isMissing) && (
                        <ValueRow className="Row" key={name} name={name} values={values} isMissing={isMissing} />
                    )
                );
            })}
        </Table>
    );
}, isEqual);
