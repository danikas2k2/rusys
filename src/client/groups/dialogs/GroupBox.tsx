import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DoneIcon from '@icons/Done.svg';
import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { Input } from '@ui/Input';
import { isEmpty } from 'lodash';
import React, { type FormEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Label } from '~/client/common/Label';
import { type WithOnClose } from '~/client/common/WithOnClose';
import { useLabel } from '~/client/hooks/useLabel';
import { compareNames } from '~/client/utils/compareNames';
import { useAddGroup } from '~/state/groups/useAddGroup';
import { useGroups } from '~/state/groups/useGroups';
import { useRenameGroup } from '~/state/groups/useRenameGroup';
import { getErrorMessage } from '~/utils/errors';
import cx from './GroupBox.less';

interface GroupBoxProps extends WithOnClose {
    group?: string;
    onClose: (group?: string) => void;
}

const ERROR_NAME_MISSING = 'Name is required';
const ERROR_EXISTS = 'Group already exists';

export function GroupBox({ group: initialGroup = '', onClose }: GroupBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup ?? '');
    const [errors, setErrors] = useState<Record<string, string>>();

    useEffect(() => {
        setErrors(undefined);
    }, [group]);

    const hasSameGroup = useGroups()?.some((g) => !compareNames(g.group, group));
    const groupRenamed = group !== initialGroup;
    const hasGroup = hasSameGroup && groupRenamed && !updating;
    useEffect(() => {
        if (hasGroup && isEmpty(errors)) {
            setErrors({ '': ERROR_EXISTS });
        }
    }, [hasGroup, errors]);

    const focusRef = useAutoFocus<HTMLInputElement>();

    const addGroup = useAddGroup();
    const renameGroup = useRenameGroup();
    const handleUpdate = useCallback(async (): Promise<void> => {
        if (!group) {
            setErrors({ group: ERROR_NAME_MISSING });
        }
        if (!group || hasGroup) {
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
            setErrors({ '': getErrorMessage(error) });
            focusRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [addGroup, focusRef, group, groupRenamed, hasGroup, initialGroup, onClose, renameGroup]);

    const handleClose = useCallback((): void => onClose(), [onClose]);

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
    const errorLabel = useLabel(errors?.[''] ?? '');
    const inputLabel = useLabel('Group name');

    return (
        <Dialog className={cx('GroupBox')} open onClose={handleClose}>
            <header>
                <div className={cx('title')}>
                    <Label>{initialGroup ? 'Edit group' : 'Add new group'}</Label>
                </div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <main>
                <Input
                    ref={focusRef}
                    fullWidth
                    color={errors?.[''] || errors?.group ? 'negative' : 'primary'}
                    error={errors?.[''] ? errorLabel : undefined}
                    size="large"
                    value={group}
                    label={inputLabel}
                    onInput={handleGroupInput}
                    onKeyDown={handleEnter}
                />
            </main>
            <footer>
                <Button variant="outlined" startDecorator={<CancelIcon />} onClick={handleClose}>
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="primary" startDecorator={<DoneIcon />} onClick={handleUpdate}>
                    <Label>{initialGroup ? 'Update' : 'Add'}</Label>
                </Button>
            </footer>
        </Dialog>
    );
}
