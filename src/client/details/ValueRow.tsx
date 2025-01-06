import Checkbox from '@ui/Checkbox';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ValueCell from '~/client/details/ValueCell';
import InteractiveName from '~/client/InteractiveName';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import { type BaseState } from '~/store/base/types';
import { type Amount, type Amounts } from '~/store/details/types';
import useUpdateDetails from '~/store/details/useUpdateDetails';
import useAddMissing from '~/store/missing/useAddMissing';
import useRemoveMissing from '~/store/missing/useRemoveMissing';
import useUpdateRemoving from '~/store/removing/useUpdateRemoving';
import { type Name, type Year } from '~/store/types';
import cx from './ValueRow.less';

interface ValueRowProps {
    className?: string;
    name: Name;
    values: Amounts;
    isMissing?: boolean;
}

export default memo(function ValueRow({ className, name, values, isMissing }: ValueRowProps) {
    const labelId = `checkbox-${name}`;
    const isAvailable = !isEmpty(values);

    const [years, isRemoving] = useSelector(
        (state: BaseState) => [state.years, state.years.some((year) => state.removing?.[name]?.[year])] as const,
        isEqual
    );
    const lastYear = years[years.length - 1];

    const addMissing = useAddMissing();
    const removeMissing = useRemoveMissing();
    const handleMissing = useCallback(
        async (name: string, isMissing: boolean): Promise<void> => {
            if (isMissing) {
                await addMissing(name);
            } else {
                await removeMissing(name);
            }
        },
        [addMissing, removeMissing]
    );

    const updateDetails = useUpdateDetails();
    const updateRemoving = useUpdateRemoving();
    const handleValue = useCallback(
        async (name: string, year: Year, value?: Amount, updateWithoutHistory = false): Promise<void> => {
            await updateDetails(name, year, value, updateWithoutHistory);
            await updateRemoving(name, year, false);
            return handleMissing(name, false);
        },
        [handleMissing, updateDetails, updateRemoving]
    );

    const handleClick = useCallback((): void => {
        if (isAvailable) {
            handleMissing(name, !isMissing);
        }
    }, [handleMissing, isAvailable, isMissing, name]);

    const handleChange = useCallback(
        (year: Year) =>
            useCallback(
                (value?: Amount, updateWithoutHistory = false) => handleValue(name, year, value, updateWithoutHistory),
                [year]
            ),
        [handleValue, name]
    );

    return (
        <Row key={name} className={cx('Row', className, { selected: isMissing })} aria-checked={!isMissing}>
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
                className={cx('name', { unavailable: !isAvailable, removing: isAvailable && isRemoving })}
            >
                <InteractiveName name={name} onClick={handleClick} />
            </Cell>
            {years.map((year) => (
                <ValueCell
                    key={year}
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
