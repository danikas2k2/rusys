import DeleteIcon from '@icons/Delete.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import classNames from 'classnames';
import React, { forwardRef, type HTMLAttributes, type Ref, useCallback, useState } from 'react';
import { VariantBox } from '~/client/variants/dialogs/VariantBox';
import { Label } from '~/client/common/Label';
import { useDeleteVariant } from '~/state/variants/useDeleteVariant';
import { getErrorMessage } from '~/utils/errors';
import cx from './VariantControls.less';

interface VariantControlsProps extends HTMLAttributes<HTMLDivElement> {
    group?: string;
    variant?: string;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export const VariantControls = forwardRef(function VariantControls(
    { group, variant, onPin, onUnpin, className, ...props }: VariantControlsProps,
    ref: Ref<HTMLDivElement>
) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleEdit = useCallback(async (): Promise<void> => {
        onPin?.();
        setDialogVisible(true);
    }, [onPin]);

    const deleteVariant = useDeleteVariant();
    const handleDelete: () => Promise<void> = useCallback(async (): Promise<void> => {
        onUnpin?.(true);
        try {
            if (group && variant) {
                await deleteVariant(group, variant);
            }
        } catch (e) {
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteVariant, group, onUnpin, variant]);

    return (
        <>
            <div ref={ref} className={classNames(className, cx('VariantControls'))} {...props}>
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
                <VariantBox
                    group={group}
                    variant={variant}
                    onClose={() => {
                        onUnpin?.();
                        setDialogVisible(false);
                    }}
                />
            )}
        </>
    );
});
