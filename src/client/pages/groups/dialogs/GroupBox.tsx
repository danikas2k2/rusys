import AddIcon from '@assets/add.svg';
import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import DoneIcon from '@assets/done.svg';

import React, { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import { isEmpty } from 'lodash';

import { Button, IconButton } from '@ui/Button';
import { Checkbox } from '@ui/Checkbox';
import { Dialog } from '@ui/Dialog';
import { Input } from '@ui/Input';

import { Label } from '~/client/common/Label';
import { useLabel } from '~/client/hooks/useLabel';
import { useGroups } from '~/client/state/groups/useGroups';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';
import cx from './GroupBox.pcss';

interface GroupBoxProps {
    group?: string;
    annual?: boolean;
    onClose?: (group?: string) => void;
}

const ERROR_NAME_MISSING = 'Name is required';
const ERROR_EXISTS = 'Group already exists';

export function GroupBox({ group: initialGroup = '', annual: initialAnnual = true, onClose }: GroupBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup);
    const [annual, setAnnual] = useState<boolean>(initialAnnual);
    const [errors, setErrors] = useState<Record<string, string>>();

    useEffect(() => {
        setErrors(undefined);
    }, [group]);

    const hasSameGroup = useGroups()?.some((g) => !compareNames(g.group, group));
    const groupAdded = !initialGroup;
    const groupRenamed = !!initialGroup && group !== initialGroup;
    const hasGroup = hasSameGroup && !updating && (groupAdded || groupRenamed);
    useEffect(() => {
        if (hasGroup && isEmpty(errors)) {
            setErrors({ _: ERROR_EXISTS });
        }
    }, [hasGroup, errors]);

    const updateGroup = useUpdateGroup();
    const renameGroup = useRenameGroup();

    const annualChanged = annual !== initialAnnual;

    const focusRef = useRef<HTMLInputElement>(null);
    useEffect(() => focusRef.current?.focus(), []);

    const handleUpdate = useCallback(async (): Promise<void> => {
        if (!group) {
            setErrors({ group: ERROR_NAME_MISSING });
        }
        if (!group || hasGroup) {
            focusRef.current?.focus();
            return;
        }
        try {
            setUpdating(true);
            if (groupRenamed) {
                await renameGroup(initialGroup, group, annual);
            } else if (groupAdded || annualChanged) {
                await updateGroup(group, annual);
            }
            onClose?.(group);
        } catch (e) {
            setErrors({ _: getErrorMessage(e) });
            focusRef.current?.focus();
        } finally {
            setUpdating(false);
        }
    }, [
        group,
        hasGroup,
        focusRef,
        groupRenamed,
        groupAdded,
        annualChanged,
        onClose,
        renameGroup,
        initialGroup,
        annual,
        updateGroup,
    ]);

    const handleClose = useCallback((): void => onClose?.(), [onClose]);

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
    const errorLabel = useLabel(errors?._ ?? '');
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
                    size="large"
                    value={group}
                    label={inputLabel}
                    onInput={handleGroupInput}
                    onKeyDown={handleEnter}
                    {...((errors?._ || errors?.group) && {
                        color: 'red',
                        invalid: true,
                    })}
                    {...(errors?._ && {
                        error: errorLabel,
                    })}
                />
                <Checkbox
                    className={cx('Annual')}
                    size="large"
                    checked={annual}
                    onChange={(e) => setAnnual(e.currentTarget.checked)}
                    onKeyDown={handleEnter}
                >
                    <Label>Annual</Label>
                </Checkbox>
            </main>
            <footer>
                <Button variant="outlined" startDecorator={<CancelIcon />} onClick={handleClose}>
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="blue" startDecorator={getButtonDecorator()} onClick={handleUpdate}>
                    <Label>{getButtonLabel()}</Label>
                </Button>
            </footer>
        </Dialog>
    );

    function getButtonLabel() {
        return initialGroup ? 'Update' : 'Add';
    }

    function getButtonDecorator() {
        return initialGroup ? <DoneIcon /> : <AddIcon />;
    }
}
