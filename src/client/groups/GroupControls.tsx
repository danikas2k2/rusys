import DeleteIcon from '@icons/Delete.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import classNames from 'classnames';
import React, { forwardRef, type HTMLAttributes, type Ref, useCallback, useState } from 'react';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { Label } from '~/client/common/Label';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';
import { getErrorMessage } from '~/utils/errors';
import cx from './GroupControls.less';

interface GroupControlsProps extends HTMLAttributes<HTMLDivElement> {
    group?: string;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export const GroupControls = forwardRef(function GroupControls(
    { group, onPin, onUnpin, className, ...props }: GroupControlsProps,
    ref: Ref<HTMLDivElement>
) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleEdit = useCallback(async (): Promise<void> => {
        onPin?.();
        setDialogVisible(true);
    }, [onPin]);

    const deleteGroup = useDeleteGroup();
    const handleDelete: () => Promise<void> = useCallback(async (): Promise<void> => {
        onUnpin?.(true);
        try {
            if (group) {
                await deleteGroup(group);
            }
        } catch (e) {
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteGroup, group, onUnpin]);

    return (
        <>
            <div ref={ref} className={classNames(className, cx('GroupControls'))} {...props}>
                <ButtonGroup align="end">
                    <Button color="primary" startDecorator={<EditIcon />} onClick={handleEdit}>
                        <Label>Edit</Label>
                    </Button>
                    <ButtonWithConfirmation
                        color="negative"
                        startDecorator={<DeleteIcon />}
                        dialogHeader={<Label>Sure to remove?</Label>}
                        onClick={handleDelete}
                        onOpen={onPin}
                        onClose={onUnpin}
                    >
                        <Label>Remove</Label>
                    </ButtonWithConfirmation>
                </ButtonGroup>
            </div>
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
    );
});
