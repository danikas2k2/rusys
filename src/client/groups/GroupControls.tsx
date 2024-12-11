import React, { type HTMLAttributes, type RefAttributes, useCallback, useState } from 'react';
import { SlideControls } from '~/client/common/SlideControls';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { getErrorMessage } from '~/common/utils/errors';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';

interface GroupControlsProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    group: string;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export function GroupControls({ group, onPin, onUnpin, ...props }: GroupControlsProps) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const onEdit = useCallback(() => {
        setDialogVisible(true);
    }, []);

    const deleteGroup = useDeleteGroup();
    const onDelete = useCallback(async () => {
        onUnpin?.(true);
        try {
            await deleteGroup(group);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteGroup, group, onUnpin]);

    return group ? (
        <>
            <SlideControls onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} {...props} />
            {dialogVisible && (
                <GroupBox
                    group={group}
                    onClose={() => {
                        onUnpin?.();
                        setDialogVisible(false);
                    }}
                />
            )}
        </>
    ) : null;
}
