import Checkbox from '@ui/Checkbox';
import Loader from '@ui/Loader';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import ValueRow from '~/client/details/ValueRow';
import { Error } from '~/client/Error';
import Label from '~/client/Label';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import Table from '~/client/table/Table';
import { filterGroupedEntries } from '~/client/utils/filterGroupedEntries';
import { useInitialLoader } from '~/hooks/useInitialLoader';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { type Amounts } from '~/state/details/types';
import { useDetails } from '~/state/details/useDetails';
import { useFilter } from '~/state/filter/useFilter';
import { useHasMissing } from '~/state/missing/useHasMissing';
import { useIsMissing } from '~/state/missing/useIsMissing';
import { type Group, type Name } from '~/state/types';
import { useYears } from '~/state/years/useYears';
import './DetailsTable.less';

export default memo(function DetailsTable() {
    const loader = useInitialLoader();
    const loading = useLockingLoader(loader);

    const hasMissing = useHasMissing();
    const missing = useIsMissing();
    const [missingOnly, setMissingOnly] = useState<boolean>(false);
    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly]);

    const handleClick = useCallback(() => hasMissing && setMissingOnly(!missingOnly), [hasMissing, missingOnly]);

    const details = useDetails();
    const filter = useFilter();
    const filteredEntries: [Group, [Name, Amounts][]][] = useMemo(
        () => filterGroupedEntries(details, filter),
        [details, filter]
    );

    const years = useYears();

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

    if (isEmpty(years) || isEmpty(details)) {
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
                    <Cell role="columnheader">
                        <Checkbox color="primary" checked={!missingOnly} disabled={!hasMissing} onClick={handleClick} />
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
            {filteredEntries.map(([group, namedValues]) => (
                <div key={group} role="rowgroup">
                    <Row className="Row GroupRow">
                        <Cell role="rowheader" className="GroupHeading">
                            {group}
                        </Cell>
                    </Row>
                    {namedValues.map(([name, values]) => {
                        const isMissing = missing(group, name);
                        return (
                            (!missingOnly || isMissing) && (
                                <ValueRow
                                    className="Row"
                                    key={name}
                                    group={group}
                                    name={name}
                                    values={values}
                                    isMissing={isMissing}
                                />
                            )
                        );
                    })}
                </div>
            ))}
        </Table>
    );
}, isEqual);
