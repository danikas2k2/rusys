import { useLongPress } from '@ui/hooks/useLongPress';
import { isEqual } from 'lodash';
import React, { useCallback, useState } from 'react';
import { ValueBox } from '~/client/details/dialogs/ValueBox';
import { ValueAmounts } from '~/client/details/ValueAmounts';
import { Cell } from '~/client/table/Cell';
import { type VariantAmount } from '~/common/types';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import cx from './ValueCell.less';

export interface ValueCellProps {
    group: string;
    name: string;
    year: number;
    amounts?: ReadonlyArray<VariantAmount>;
    removing?: boolean;
    last?: boolean;
    onChange: (amounts?: ReadonlyArray<VariantAmount>, withoutHistory?: boolean) => void;
}

export function ValueCell({ group, name, year, amounts, removing, last, onChange }: ValueCellProps) {
    const [editing, setEditing] = useState(false);
    const handleOpen = useCallback(() => setEditing(true), []);
    const handleClose = useCallback(
        (updated?: ReadonlyArray<VariantAmount>, withoutHistory = false): void => {
            setEditing(false);
            const optimized = updated?.filter(({ amount }) => amount > 0) ?? [];
            if (!isEqual(amounts, optimized)) {
                onChange(optimized, withoutHistory);
            }
        },
        [onChange, amounts]
    );

    const handleShortPress = editing ? undefined : handleOpen;

    const setRemoving = useSetDetailsRemoving();
    // TODO add setRemoving to edit dialog
    const handleLongPress = useCallback((): void => {
        void setRemoving(group, name, year, !removing);
        navigator?.vibrate?.(200);
    }, [setRemoving, group, name, year, removing]);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, handleShortPress);
    const empty = !amounts?.length;
    return (
        <>
            <Cell
                className={cx('ValueCell', { empty, last, removing })}
                {...(empty ? { onClick: handleShortPress, onContextMenu: longPress.onContextMenu } : { ...longPress })}
            >
                {empty ? '.' : <ValueAmounts group={group} amounts={amounts} />}
            </Cell>
            {editing && <ValueBox group={group} name={name} year={year} amounts={amounts} onClose={handleClose} />}
        </>
    );
}
