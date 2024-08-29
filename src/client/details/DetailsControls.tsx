import DeleteIcon from '@icons/Delete.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import classNames from 'classnames';
import React, { forwardRef, type HTMLAttributes, type Ref, useCallback, useState } from 'react';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Label } from '~/client/common/Label';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';
import { getErrorMessage } from '~/utils/errors';
import cx from './DetailsControls.less';

interface DetailsControlsProps extends HTMLAttributes<HTMLDivElement> {
    group?: string;
    name?: string;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export const DetailsControls = forwardRef(function DetailsControls(
    { group, name, onPin, onUnpin, className, ...props }: DetailsControlsProps,
    ref: Ref<HTMLDivElement>
) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleEdit = useCallback(async (): Promise<void> => {
        onPin?.();
        setDialogVisible(true);
    }, [onPin]);

    const deleteDetails = useDeleteDetails();
    const handleDelete: () => Promise<void> = useCallback(async (): Promise<void> => {
        onUnpin?.(true);
        try {
            if (group && name) {
                await deleteDetails(group, name);
            }
        } catch (e) {
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteDetails, group, name, onUnpin]);

    return (
        <>
            <div ref={ref} className={classNames(className, cx('DetailsControls'))} {...props}>
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
                <DetailsBox
                    group={group}
                    name={name}
                    onClose={() => {
                        onUnpin?.();
                        setDialogVisible(false);
                    }}
                />
            )}
        </>
    );
});
