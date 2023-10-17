import useLongTouch from '@ui/hooks/useLondTouch';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ValueBox from '~/client/dialogs/ValueBox';
import Cell from '~/client/table/Cell';
import ValueVariant from '~/client/ValueVariant';
import { type BaseState } from '~/store/base/types';
import { type Amount, type Variant } from '~/store/details/types';
import useVariantComparator from '~/store/details/useVariantComparator';
import useUpdateRemoving from '~/store/removing/useUpdateRemoving';
import { type Name, type Year } from '~/store/types';
import { onActionKey, preventDefault, stopPropagation } from '~/utils/events';
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

    const onClick =
        editing || isEditing
            ? // eslint-disable-next-line no-console
              () => console.info('EDITING')
            : handleOpen;

    const updateRemoving = useUpdateRemoving();
    const onLongTouch = preventDefault((): void => void updateRemoving(name, year, !isRemoving));
    const { onTouchStart, onTouchEnd } = useLongTouch<HTMLDivElement>(onLongTouch);

    const cmpVariants = useVariantComparator();
    const empty = isEmpty(value);
    return (
        <Cell
            className={classNames('ValueCell', { editing, empty, last: isLast, removing: isRemoving })}
            onClick={onClick}
            onDoubleClick={onLongTouch}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchEnd}
            onKeyDown={onActionKey(onClick)}
            onContextMenu={preventDefault(stopPropagation())}
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
            {editing && <ValueBox name={name} year={year} value={value} onClose={handleClose} />}
        </Cell>
    );
}
