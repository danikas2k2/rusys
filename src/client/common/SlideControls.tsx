import DeleteIcon from '@assets/Delete.svg';
import EditIcon from '@assets/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { uniqueId } from '@ui/utils/uniqueId';
import classNames from 'classnames';
import React, { forwardRef, type HTMLAttributes, type MouseEventHandler, type Ref, useCallback } from 'react';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Label } from '~/client/common/Label';
import cx from './SlideControls.less';

interface GroupControlsProps extends HTMLAttributes<HTMLDivElement> {
    onEdit?: MouseEventHandler<HTMLButtonElement>;
    onRemove?: MouseEventHandler<HTMLButtonElement>;
    group?: string;
    onPin?: () => void;
    onUnpin?: (hide?: boolean) => void;
}

export const SlideControls = forwardRef(function SlideControls(
    { onEdit, onRemove, onPin, onUnpin, className, ...props }: GroupControlsProps,
    ref: Ref<HTMLDivElement>
) {
    const handleEdit: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            onPin?.();
            onEdit?.(e);
        },
        [onEdit, onPin]
    );
    const editId = uniqueId('edit');
    const edit = (
        <Button id={editId} color="primary" startDecorator={<EditIcon />} onClick={handleEdit}>
            <Label>Edit</Label>
        </Button>
    );

    const handleRemove: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            onUnpin?.(true);
            onRemove?.(e);
        },
        [onRemove, onUnpin]
    );
    const removeId = uniqueId('remove');
    const remove = (
        <ButtonWithConfirmation
            id={removeId}
            color="negative"
            startDecorator={<DeleteIcon />}
            dialogHeader={<Label>Sure to remove?</Label>}
            onClick={handleRemove}
            onOpen={onPin}
            onClose={onUnpin}
        >
            <Label>Remove</Label>
        </ButtonWithConfirmation>
    );

    return (
        <div
            ref={ref}
            role="group"
            aria-labelledby={`${editId} ${removeId}`}
            aria-owns={`${editId} ${removeId}`}
            className={classNames(className, cx('SlideControls'))}
            {...props}
        >
            <ButtonGroup align="end">
                {edit}
                {remove}
            </ButtonGroup>
        </div>
    );
});
