import React, { useCallback, useState } from 'react';

import { useLongPress } from '@ui/hooks/useLongPress';

import { UpdateTypeContextWrapper } from '~/client/common/UpdateTypeContext';
import { ValueBox } from '~/client/pages/details/dialogs/ValueBox';
import { ValueAmounts } from '~/client/pages/details/ValueAmounts';
import { useSetDetailsRemoving } from '~/client/state/details/useSetDetailsRemoving';
import { useUpdateDetails } from '~/client/state/details/useUpdateDetails';
import { useProfile } from '~/client/state/profile/useProfile';
import { Cell } from '~/client/table/Cell';
import { type VariantAmount } from '~/types/data';
import cx from './ValueCell.pcss';

export interface ValueCellProps {
    group: string;
    name: string;
    year: number;
    amounts?: ReadonlyArray<VariantAmount>;
    preferred?: boolean;
    removing?: boolean;
    last?: boolean;
    span?: number;
}

export function ValueCell({
    group,
    name,
    year,
    amounts,
    preferred,
    removing = false,
    last = false,
    span,
}: ValueCellProps) {
    const profile = useProfile();
    const updateDetails = useUpdateDetails();
    const setRemoving = useSetDetailsRemoving();

    const [editing, setEditing] = useState(false);
    const handleOpen = useCallback(() => setEditing(true), []);
    const handleClose = useCallback(
        (changed?: ReadonlyArray<VariantAmount>): void => {
            setEditing(false);
            const clean = changed?.filter(({ amount }) => !!amount) ?? [];
            if (clean.length) {
                void updateDetails(group, name, span ? 0 : year, clean, profile.email);
            }
        },
        [updateDetails, group, name, year, span, profile.email]
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
                className={cx('ValueCell', { empty, last, preferred, removing, span: !!span })}
                style={span ? { gridColumn: `span ${span}` } : undefined}
                {...(empty ? { onClick: handleShortPress, onContextMenu: longPress.onContextMenu } : { ...longPress })}
            >
                {empty ? '.' : <ValueAmounts group={group} amounts={amounts} />}
            </Cell>
            {editing && (
                <UpdateTypeContextWrapper>
                    <ValueBox group={group} name={name} year={year} amounts={amounts} onClose={handleClose} />
                </UpdateTypeContextWrapper>
            )}
        </>
    );
}
