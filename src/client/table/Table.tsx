import Checkbox from '@ui/Checkbox';
import Loader from '@ui/Loader';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import ValueRow from '~/client/table/ValueRow';
import { cmp } from '~/client/utils/cmp';
import { matchParts } from '~/client/utils/matchParts';
import type { BaseState } from '~/store/base/types';
import useInitialLoader from '~/store/base/useInitialLoader';
import type { Name, Values } from '~/store/details/types';
import './Table.less';

export default function Table(): JSX.Element {
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
        (state: BaseState) => [state.missing, state.years, state.details, state.filter] as const
    );
    const [missingOnly, setMissingOnly] = useState<boolean>(false);
    const hasMissing = !!missing.length;

    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    const detailsEntries: [Name, Values][] = useMemo(
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
        <div className="Table">
            <div className="Head">
                <Row className="Row">
                    <Cell>
                        <Checkbox
                            color="primary"
                            checked={!missingOnly}
                            disabled={!hasMissing}
                            onClick={() => hasMissing && setMissingOnly(!missingOnly)}
                        />
                    </Cell>
                    <Cell />
                    {years.map((year) => (
                        <Cell key={year}>{year}</Cell>
                    ))}
                </Row>
            </div>
            <div className="Body">
                {filteredEntries.map(([name, values]) => {
                    const isMissing = missing.includes(name);
                    return (
                        (!missingOnly || isMissing) && (
                            <ValueRow key={name} name={name} values={values} isMissing={isMissing} />
                        )
                    );
                })}
            </div>
        </div>
    );
}
