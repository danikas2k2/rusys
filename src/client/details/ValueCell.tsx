import React, { useCallback, useState } from 'react';
import { useLongPress } from '@ui/hooks/useLongPress';
import { RecycledContextWrapper } from '~/client/common/RecycledContext';
import { ValueBox } from '~/client/details/dialogs/ValueBox';
import { ValueAmounts } from '~/client/details/ValueAmounts';
import { Cell } from '~/client/table/Cell';
import { type VariantAmount } from '~/common/types';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import cx from './ValueCell.less';

export interface ValueCellProps {
    group: string;
    name: string;
    year: number;
    amounts?: ReadonlyArray<VariantAmount>;
    removing?: boolean;
    last?: boolean;
}

export function ValueCell({ group, name, year, amounts, removing = false, last = false }: ValueCellProps) {
    const updateDetails = useUpdateDetails();
    const setRemoving = useSetDetailsRemoving();

    const [editing, setEditing] = useState(false);
    const handleOpen = useCallback(() => setEditing(true), []);
    const handleClose = useCallback(
        (changed?: ReadonlyArray<VariantAmount>): void => {
            setEditing(false);
            const clean = changed?.filter(({ amount }) => !!amount) ?? [];
            if (clean.length) {
                void updateDetails(group, name, year, clean);
            }
        },
        [updateDetails, group, name, year]
    );

    const handleShortPress = editing ? undefined : handleOpen;

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
            {editing && (
                <RecycledContextWrapper>
                    <ValueBox group={group} name={name} year={year} amounts={amounts} onClose={handleClose} />
                </RecycledContextWrapper>
            )}
        </>
    );
}
