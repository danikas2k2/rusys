import useLongPress from '@ui/hooks/useLongPress';
import Interactive from '@ui/Interactive';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { type JSX, type UIEvent, useCallback, useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
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
    isLast?: boolean;
    onChange: (value?: Amount) => void;
}

export default function ValueCell({ value, name, year, isLast, onChange }: ValueCellProps): JSX.Element {
    const [isEditing, isRemoving] = useSelector(
        (state: BaseState) => [state.editing.enabled, state.removing?.[name]?.[year]] as const,
        shallowEqual
    );
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (editing && isEditing) {
            setEditing(false);
        }
    }, [editing, isEditing]);

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

    const onClick = editing || isEditing ? undefined : handleOpen;

    const updateRemoving = useUpdateRemoving();
    const onLongPress = useCallback(
        (e: UIEvent): void => {
            e.preventDefault();
            e.stopPropagation();
            // e.nativeEvent.preventDefault();
            // e.nativeEvent.stopPropagation();
            // e.nativeEvent.stopImmediatePropagation();

            void updateRemoving(name, year, !isRemoving);
            navigator?.vibrate?.(200);
        },
        [isRemoving, name, updateRemoving, year]
    );

    const longPress = useLongPress<HTMLDivElement>(onLongPress);

    const cmpVariants = useVariantComparator();
    const empty = isEmpty(value);
    return (
        <Cell className={classNames('ValueCell', { editing, empty, last: isLast, removing: isRemoving })}>
            <Interactive onClick={onClick} {...longPress}>
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
            </Interactive>
            {editing && <ValueBox name={name} year={year} value={value} onClose={handleClose} />}
        </Cell>
    );
}
