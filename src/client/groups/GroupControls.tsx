import React, { forwardRef, type HTMLAttributes, type Ref, useCallback, useState } from 'react';
import { SlideControls } from '~/client/common/SlideControls';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { getErrorMessage } from '~/common/utils/errors';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';

interface GroupControlsProps extends HTMLAttributes<HTMLDivElement> {
    group: string;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export const GroupControls = forwardRef(function GroupControls(
    { group, onPin, onUnpin, ...props }: GroupControlsProps,
    ref: Ref<HTMLDivElement>
) {
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
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteGroup, group, onUnpin]);

    return group ? (
        <>
            <SlideControls ref={ref} onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} {...props} />
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
});
