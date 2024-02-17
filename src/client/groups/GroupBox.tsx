import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DeleteIcon from '@icons/Delete.svg';
import DoneIcon from '@icons/Done.svg';
import { Button } from '@ui/Button';
import { ButtonWithConfirmation } from '@ui/ButtonWithConfirmation';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { IconButton } from '@ui/IconButton';
import { LabeledInput } from '@ui/LabeledInput';
import React, { type FormEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { Label } from '~/client/Label';
import { compareNames } from '~/client/utils/compareNames';
import { useAddGroup } from '~/state/groups/useAddGroup';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';
import { useGroups } from '~/state/groups/useGroups';
import { useRenameGroup } from '~/state/groups/useRenameGroup';
import { getErrorMessage } from '~/utils/errors';
import cx from './GroupBox.less';

interface GroupBoxProps {
    group?: string;
    onClose: (group?: string) => void;
}

const ERROR_MISSING = 'Name is required';
const ERROR_EXISTS = 'Group already exists';

export function GroupBox({ group: initialGroup = '', onClose }: GroupBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup ?? '');
    const [error, setError] = useState<string>();
    console.info(error);

    useEffect(() => {
        setError(undefined);
    }, [group]);

    const hasSameGroup = useGroups()?.some((g) => !compareNames(g.group, group));
    const groupRenamed = group !== initialGroup;
    const hasGroup = hasSameGroup && groupRenamed && !updating;
    console.info(hasGroup, { hasSameGroup, groupRenamed, updating });
    useEffect(() => {
        if (hasGroup && !error) {
            setError(ERROR_EXISTS);
        }
    }, [hasGroup, error]);

    const focusRef = useAutoFocus<HTMLInputElement>();

    const addGroup = useAddGroup();
    const renameGroup = useRenameGroup();
    const handleUpdate = useCallback(async (): Promise<void> => {
        if (!group) {
            setError(ERROR_MISSING);
            focusRef?.focus();
            return;
        }
        if (hasGroup) {
            focusRef?.focus();
            return;
        }
        try {
            setUpdating(true);
            if (initialGroup) {
                if (groupRenamed) {
                    await renameGroup(initialGroup, group);
                }
            } else {
                await addGroup(group);
            }
            onClose(group);
        } catch (error) {
            setError(getErrorMessage(error));
            focusRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [addGroup, focusRef, group, hasGroup, initialGroup, onClose, renameGroup]);

    const deleteGroup = useDeleteGroup();
    const handleDelete = useCallback(async (): Promise<void> => {
        try {
            setUpdating(true);
            await deleteGroup(initialGroup);
            onClose(initialGroup);
        } catch (error) {
            setError(getErrorMessage(error));
            focusRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [focusRef, initialGroup, onClose, deleteGroup]);

    const handleClose = useCallback((): void => {
        onClose();
    }, [onClose]);

    const handleGroupInput = useCallback((e: FormEvent<HTMLInputElement>) => setGroup(e.currentTarget.value), []);

    const handleEnter = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                void handleUpdate();
            }
        },
        [handleUpdate]
    );

    const closeLabel = useLabel('Close');
    const errorLabel = useLabel(error ?? '');
    console.info({ errorLabel });
    const inputLabel = useLabel('Group name');
    return (
        <Dialog className={cx('GroupBox')} open onClose={handleClose}>
            <header>
                <div className={cx('title')}>
                    <Label>{initialGroup ? 'Update group' : 'Add new group'}</Label>
                </div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <main>
                <LabeledInput
                    ref={focusRef}
                    fullWidth
                    color={error ? 'negative' : 'primary'}
                    error={error && error !== ERROR_MISSING ? errorLabel : undefined}
                    size="large"
                    value={group}
                    label={inputLabel}
                    onInput={handleGroupInput}
                    onKeyDown={handleEnter}
                />
            </main>
            <footer>
                {initialGroup && (
                    <>
                        <ButtonWithConfirmation
                            variant="outlined"
                            color="negative"
                            onClick={handleDelete}
                            header={<Label>Sure to remove?</Label>}
                            cancel={
                                <>
                                    <CancelIcon />
                                    <Label>Cancel</Label>
                                </>
                            }
                            confirm={
                                <>
                                    <DeleteIcon />
                                    <Label>Remove</Label>
                                </>
                            }
                            confirmColor="negative"
                        >
                            <DeleteIcon />
                            <Label>Remove</Label>
                        </ButtonWithConfirmation>
                        <div className={cx('spacer')} />
                    </>
                )}
                <Button variant="outlined" onClick={handleClose}>
                    <CancelIcon />
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="primary" onClick={handleUpdate}>
                    <DoneIcon />
                    <Label>{initialGroup ? 'Update' : 'Add'}</Label>
                </Button>
            </footer>
        </Dialog>
    );
}
