import useLongPress from '@ui/hooks/useLongPress';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ValueBox from '~/client/dialogs/ValueBox';
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
    onChange: (value?: Amount) => void;
}

export default memo(function ValueCell({ name, year, value, last, onChange }: ValueCellProps) {
    const nameEditing = useSelector((state: BaseState) => state.editing.enabled);
    const [editing, setEditing] = useState(false);
    useEffect(() => {
        if (editing && nameEditing) {
            setEditing(false);
        }
    }, [editing, nameEditing]);

    const handleOpen = useCallback((): void => {
        setEditing(true);
    }, []);

    const handleClose = useCallback(
        (updatedValue?: Amount): void => {
            setEditing(false);
            const optimizedValue = {
                ...Object.fromEntries(Object.entries(updatedValue ?? {}).filter(([, v]) => v > 0)),
            };
            if (!isEqual(value, optimizedValue)) {
                onChange(optimizedValue);
            }
        },
        [onChange, value]
    );

    const handleShortClick = editing || nameEditing ? undefined : handleOpen;

    const removing = useSelector((state: BaseState) => state.removing?.[name]?.[year]);
    const updateRemoving = useUpdateRemoving();
    const handleLongPress = useCallback((): void => {
        void updateRemoving(name, year, !removing);
        navigator?.vibrate?.(200);
    }, [removing, name, updateRemoving, year]);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, handleShortClick);

    console.info('.', name, year);

    const empty = isEmpty(value);
    const cmpVariants = useVariantComparator();
    return (
        <>
            <Cell className={classNames('ValueCell', { empty, last, removing })} {...longPress}>
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
