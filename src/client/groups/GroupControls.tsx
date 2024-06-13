import DeleteIcon from '@icons/Delete.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import classNames from 'classnames';
import React, { forwardRef, type HTMLAttributes, type Ref, useState } from 'react';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { Label } from '~/client/common/Label';
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
    return (
        <>
            <div ref={ref} className={classNames(className, cx('GroupControls'))} {...props}>
                <ButtonGroup align="right">
                    <Button
                        color="primary"
                        startDecorator={<EditIcon />}
                        onClick={() => {
                            onPin?.();
                            setDialogVisible(true);
                        }}
                    >
                        <Label>Edit</Label>
                    </Button>
                    <ButtonWithConfirmation
                        color="negative"
                        startDecorator={<DeleteIcon />}
                        dialogHeader={<Label>Sure to remove?</Label>}
                        onClick={() => onUnpin?.(true)}
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
