import Checkbox from '@ui/Checkbox';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import ValueCell from '~/client/details/ValueCell';
import InteractiveName from '~/client/InteractiveName';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import { type Amount, type Amounts } from '~/state/details/types';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import { useAddMissing } from '~/state/missing/useAddMissing';
import { useRemoveMissing } from '~/state/missing/useRemoveMissing';
import { useHasRemoving } from '~/state/removing/useHasRemoving';
import { useUpdateRemoving } from '~/state/removing/useUpdateRemoving';
import { type Group, type Name, type Year } from '~/state/types';
import { useYears } from '~/state/years/useYears';
import './ValueRow.less';

interface ValueRowProps {
    className?: string;
    group: Group;
    name: Name;
    values: Amounts;
    isMissing?: boolean;
}

export default memo(function ValueRow({ className, group, name, values, isMissing }: ValueRowProps) {
    const labelId = `checkbox-${group}-${name}`;
    const isAvailable = !isEmpty(values);

    const years = useYears();
    const lastYear = years[years.length - 1];

    const isRemoving = useHasRemoving(group, name);

    const addMissing = useAddMissing();
    const removeMissing = useRemoveMissing();
    const handleMissing = useCallback(
        async (group: Group, name: Name, isMissing: boolean): Promise<void> => {
            if (isMissing) {
                await addMissing(group, name);
            } else {
                await removeMissing(group, name);
            }
        },
        [addMissing, removeMissing]
    );

    const updateDetails = useUpdateDetails();
    const updateRemoving = useUpdateRemoving();
    const handleValue = useCallback(
        async (group: Group, name: Name, year: Year, value?: Amount, updateWithoutHistory = false): Promise<void> => {
            await updateDetails(group, name, year, value, updateWithoutHistory);
            await updateRemoving(group, name, year, false);
            return handleMissing(group, name, false);
        },
        [handleMissing, updateDetails, updateRemoving]
    );

    const handleClick = useCallback((): void => {
        if (isAvailable) {
            handleMissing(group, name, !isMissing);
        }
    }, [group, handleMissing, isAvailable, isMissing, name]);

    const handleChange = useCallback(
        (year: Year) =>
            useCallback(
                (value?: Amount, updateWithoutHistory = false) =>
                    handleValue(group, name, year, value, updateWithoutHistory),
                [year]
            ),
        [group, handleValue, name]
    );

    return (
        <Row key={name} className={classNames('Row', className)} aria-checked={!isMissing}>
            <Cell>
                <Checkbox
                    color="primary"
                    checked={!isMissing}
                    disabled={!isAvailable}
                    indeterminate={!isAvailable}
                    aria-labelledby={labelId}
                    onClick={handleClick}
                />
            </Cell>
            <Cell
                id={labelId}
                className={classNames('name', { unavailable: !isAvailable, removing: isAvailable && isRemoving })}
            >
                <InteractiveName name={name} onClick={handleClick} />
            </Cell>
            {years.map((year) => (
                <ValueCell
                    key={year}
                    group={group}
                    name={name}
                    year={year}
                    value={values[year]}
                    last={year === lastYear}
                    onChange={handleChange(year)}
                />
            ))}
        </Row>
    );
}, isEqual);
