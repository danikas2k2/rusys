import { useLongPress } from '@ui/hooks/useLongPress';
import classNames from 'classnames';
import { isEmpty, isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import ValueBox from '~/client/details/dialogs/ValueBox';
import Cell from '~/client/table/Cell';
import ValueVariant from '~/client/ValueVariant';
import { type Amount, type Variant } from '~/state/details/types';
import { useIsRemoving } from '~/state/removing/useIsRemoving';
import { useUpdateRemoving } from '~/state/removing/useUpdateRemoving';
import { type Group, type Name, type Year } from '~/state/types';
import { useVariantComparator } from '~/state/variants/useVariantComparator';
import './ValueCell.less';

interface ValueCellProps {
    group: Group;
    name: Name;
    year: Year;
    value?: Amount;
    last?: boolean;
    onChange: (value?: Amount, updateWithoutHistory?: boolean) => void;
}

export default memo(function ValueCell({ group, name, year, value, last, onChange }: ValueCellProps) {
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

    const removing = useIsRemoving(group, name, year);
    const updateRemoving = useUpdateRemoving();
    const handleLongPress = useCallback((): void => {
        void updateRemoving(group, name, year, !removing);
        navigator?.vibrate?.(200);
    }, [updateRemoving, group, name, year, removing]);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, handleShortPress);
    const empty = isEmpty(value);
    const compareVariants = useVariantComparator();
    return (
        <>
            <Cell
                className={classNames('ValueCell', { empty, last, removing })}
                {...(empty ? { onClick: handleShortPress, onContextMenu: longPress.onContextMenu } : { ...longPress })}
            >
                {empty
                    ? '.'
                    : Object.entries(value)
                          .sort(([a], [b]) => compareVariants(a, b))
                          .map(([k, v]) => (
                              <span className={classNames('value')} key={k}>
                                  {v}
                                  <sub>
                                      <ValueVariant variant={k as Variant} />
                                  </sub>
                              </span>
                          ))}
            </Cell>
            {editing && <ValueBox group={group} name={name} year={year} value={value} onClose={handleClose} />}
        </>
    );
});
