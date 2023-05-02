import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ValueBox from '~/client/dialogs/ValueBox';
import Cell from '~/client/table/Cell';
import ValueVariant from '~/client/ValueVariant';
import { type BaseState } from '~/store/base/types';
import { type Name, type Value, type Variant, type Year } from '~/store/details/types';
import useVariantComparator from '~/store/details/useVariantComparator';
import { onActionKey } from '~/utils/events';
import './ValueCell.less';

interface ValueCellProps {
    name?: Name;
    year?: Year;
    value?: Value;
    isLast?: boolean;
    onChange: (value?: Value) => void;
}

export default function ValueCell({ value, name, year, isLast, onChange }: ValueCellProps): JSX.Element {
    const isEditing = useSelector((state: BaseState) => state.editing.enabled);
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
        (updatedValue?: Value): void => {
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

    const cmpVariants = useVariantComparator();
    return (
        <Cell onClick={onClick} onKeyDown={onActionKey(onClick)} className={classNames('ValueCell', { editing })}>
            {isEmpty(value) ? (
                <span className="empty">.</span>
            ) : (
                Object.entries(value)
                    .sort(([a], [b]) => cmpVariants(a, b))
                    .map(([k, v]) => (
                        <span className={classNames('value', { remove: isLast })} key={k}>
                            {v}
                            <sub>
                                <ValueVariant variant={k as Variant} />
                            </sub>
                        </span>
                    ))
            )}
            {editing && <ValueBox name={name} year={year} value={value} onClose={handleClose} />}
        </Cell>
    );
}
