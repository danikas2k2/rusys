import React, { useCallback, type HTMLAttributes, type MouseEventHandler, type RefAttributes } from 'react';
import DeleteIcon from '@assets/delete.svg';
import EditIcon from '@assets/edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { uniqueId } from '@ui/utils/uniqueId';
import { useActiveRow } from '~/client/common/ActiveRowContext';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Label } from '~/client/common/Label';
import classNames from 'classnames';
import cx from './SlideControls.pcss';

export interface SlideControlsProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    onEdit?: MouseEventHandler<HTMLButtonElement>;
    onRemove?: MouseEventHandler<HTMLButtonElement>;
}

export function SlideControls({ onEdit, onRemove, className, ...props }: SlideControlsProps) {
    const [activeRow, setActiveRow] = useActiveRow();

    const handleOpen = useCallback(
        () => setActiveRow(activeRow ? { ...activeRow, pinned: true } : undefined),
        [activeRow, setActiveRow]
    );

    const handleClose = useCallback(() => setActiveRow({ ...activeRow, pinned: false }), [activeRow, setActiveRow]);

    const handleEdit: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            setActiveRow({ ...activeRow, pinned: true, editing: true });
            onEdit?.(e);
        },
        [activeRow, onEdit, setActiveRow]
    );
    const editId = uniqueId('edit');
    const editButton = (
        <Button id={editId} color="blue" startDecorator={<EditIcon />} onClick={handleEdit}>
            <Label>Edit</Label>
        </Button>
    );

    const handleRemove: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            setActiveRow(undefined);
            onRemove?.(e);
        },
        [onRemove, setActiveRow]
    );
    const removeId = uniqueId('remove');
    const removeButton = (
        <ButtonWithConfirmation
            id={removeId}
            color="red"
            startDecorator={<DeleteIcon />}
            dialogHeader={<Label>Sure to remove?</Label>}
            onClick={handleRemove}
            onOpen={handleOpen}
            onClose={handleClose}
        >
            <Label>Remove</Label>
        </ButtonWithConfirmation>
    );

    return (
        <div
            role="group"
            aria-labelledby={`${editId} ${removeId}`}
            aria-owns={`${editId} ${removeId}`}
            className={classNames(className, cx('SlideControls'))}
            {...props}
        >
            <ButtonGroup align="end">
                {editButton}
                {removeButton}
            </ButtonGroup>
        </div>
    );
}
