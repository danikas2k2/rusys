import Checkbox from '@ui/Checkbox';
import useLongTouch from '@ui/hooks/useLondTouch';
import Interactive from '@ui/Interactive';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import React, { type JSX, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cell from '~/client/table/Cell';
import Row from '~/client/table/Row';
import ValueCell from '~/client/table/ValueCell';
import { type BaseState } from '~/store/base/types';
import { type Name, type Value, type Values, type Year } from '~/store/details/types';
import useUpdateDetails from '~/store/details/useUpdateDetails';
import { enableEditingAction } from '~/store/editing/actions';
import useAddMissing from '~/store/missing/useAddMissing';
import useRemoveMissing from '~/store/missing/useRemoveMissing';
import { preventDefault } from '~/utils/events';
import './ValueRow.less';

interface ValueRowProps {
    name: Name;
    values: Values;
    isMissing?: boolean;
}

export default function ValueRow({ name, values, isMissing }: ValueRowProps): JSX.Element {
    const dispatch = useDispatch();
    const years = useSelector((state: BaseState) => state.years);
    const lastYear = years[years.length - 1];
    const labelId = `checkbox-${name}`;
    const isAvailable = !isEmpty(values);
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
    const handleValue = async (name: string, year: Year, value?: Value): Promise<void> => {
        await updateDetails(name, year, value);
        return handleMissing(name, false);
    };

    const onClick = (): void => {
        if (isAvailable) {
            handleMissing(name, !isMissing);
        }
    };

    const handleLongTouch = preventDefault((): void => {
        dispatch(enableEditingAction(name));
    });

    const { onTouchStart, onTouchEnd } = useLongTouch<HTMLDivElement>(handleLongTouch);

    const isLastYearOnly = years.filter((year) => values[year]).every((year) => year === lastYear);

    return (
        <Row key={name} className={classNames('Row', { selected: isMissing })} aria-checked={!isMissing}>
            <Cell>
                <Checkbox
                    color="primary"
                    checked={!isMissing}
                    disabled={!isAvailable}
                    indeterminate={!isAvailable}
                    aria-labelledby={labelId}
                    onClick={onClick}
                />
            </Cell>
            <Cell
                id={labelId}
                className={classNames('name', { unavailable: !isAvailable, remove: isAvailable && isLastYearOnly })}
            >
                <Interactive
                    onClick={onClick}
                    onDoubleClick={handleLongTouch}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onTouchMove={onTouchEnd}
                >
                    {name}
                </Interactive>
            </Cell>
            {years.map((year) => (
                <ValueCell
                    key={year}
                    name={name}
                    year={year}
                    value={values[year]}
                    isLast={year === lastYear}
                    onChange={(value) => handleValue(name, year, value)}
                />
            ))}
        </Row>
    );
}
