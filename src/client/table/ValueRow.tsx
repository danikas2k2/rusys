import Checkbox from '@ui/Checkbox';
import useLongPress from '@ui/hooks/useLongPress';
import Interactive from '@ui/Interactive';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import ValueCell from '~/client/table/ValueCell';
import { type BaseState } from '~/store/base/types';
import { type Amount, type Amounts } from '~/store/details/types';
import useUpdateDetails from '~/store/details/useUpdateDetails';
import { enableEditingAction } from '~/store/editing/actions';
import useAddMissing from '~/store/missing/useAddMissing';
import useRemoveMissing from '~/store/missing/useRemoveMissing';
import useUpdateRemoving from '~/store/removing/useUpdateRemoving';
import { type Name, type Year } from '~/store/types';
import './ValueRow.less';

interface ValueRowProps {
    name: Name;
    values: Amounts;
    isMissing?: boolean;
}

export default memo(function ValueRow({ name, values, isMissing }: ValueRowProps) {
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
        async (name: string, year: Year, value?: Amount): Promise<void> => {
            await updateDetails(name, year, value);
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
        (year: Year) => useCallback((value?: Amount) => handleValue(name, year, value), []),
        [handleValue, name]
    );

    const dispatch = useDispatch();
    const handleLongPress = useCallback(() => {
        dispatch(enableEditingAction(name));
        navigator?.vibrate?.(200);
    }, [dispatch, name]);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, handleClick);

    return (
        <Row key={name} className={classNames('Row', { selected: isMissing })} aria-checked={!isMissing}>
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
                <Interactive {...longPress}>{name}</Interactive>
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
