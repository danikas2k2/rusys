import useLongPress from '@ui/hooks/useLongPress';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import ValueBox from '~/client/details/dialogs/ValueBox';
import Cell from '~/client/table/Cell';
import ValueVariant from '~/client/ValueVariant';
import { type BaseState } from '~/store/base/types';
import { type Amount, type Variant } from '~/store/details/types';
import useVariantComparator from '~/store/details/useVariantComparator';
import useUpdateRemoving from '~/store/removing/useUpdateRemoving';
import { type Name, type Year } from '~/store/types';
import './ValueCell.less';

interface ValueCellProps {
    name: Name;
    year: Year;
    value?: Amount;
    last?: boolean;
    onChange: (value?: Amount, updateWithoutHistory?: boolean) => void;
}

export default memo(function ValueCell({ name, year, value, last, onChange }: ValueCellProps) {
    const [editing, setEditing] = useState(false);

    const handleOpen = useCallback((): void => {
        setEditing(true);
    }, []);

    const handleClose = useCallback(
        (updatedValue?: Amount, updateWithoutHistory = false): void => {
            setEditing(false);
            const optimizedValue = {
                ...Object.fromEntries(Object.entries(updatedValue ?? {}).filter(([, v]) => v > 0)),
            };
            if (!isEqual(value, optimizedValue)) {
                onChange(optimizedValue, updateWithoutHistory);
            }
        },
        [onChange, value]
    );

    const handleShortPress = editing ? undefined : handleOpen;

    const removing = useSelector((state: BaseState) => state.removing?.[name]?.[year]);
    const updateRemoving = useUpdateRemoving();
    const handleLongPress = useCallback((): void => {
        void updateRemoving(name, year, !removing);
        navigator?.vibrate?.(200);
    }, [removing, name, updateRemoving, year]);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, handleShortPress);

    const empty = isEmpty(value);
    const cmpVariants = useVariantComparator();
    return (
        <>
            <Cell
                className={classNames('ValueCell', { empty, last, removing })}
                {...(empty ? { onClick: handleShortPress, onContextMenu: longPress.onContextMenu } : { ...longPress })}
            >
                {empty
                    ? '.'
                    : Object.entries(value)
                          .sort(([a], [b]) => cmpVariants(a, b))
                          .map(([k, v]) => (
                              <span className={classNames('value')} key={k}>
                                  {v}
                                  <sub>
                                      <ValueVariant variant={k as Variant} />
                                  </sub>
                              </span>
                          ))}
            </Cell>
            {editing && <ValueBox name={name} year={year} value={value} onClose={handleClose} />}
        </>
    );
});
