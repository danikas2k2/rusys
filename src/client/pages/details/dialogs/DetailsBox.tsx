import AddIcon from '@assets/add.svg';
import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import DoneIcon from '@assets/done.svg';
import MoveIcon from '@assets/move-item.svg';

import React, { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import { isEmpty } from 'lodash';

import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { Input } from '@ui/Input';
import { Option, Select } from '@ui/Select';

import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useLabel } from '~/client/hooks/useLabel';
import { useAddDetails } from '~/client/state/details/useAddDetails';
import { useDetails } from '~/client/state/details/useDetails';
import { useMoveDetails } from '~/client/state/details/useMoveDetails';
import { useRenameDetails } from '~/client/state/details/useRenameDetails';
import { useGroups } from '~/client/state/groups/useGroups';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';
import cx from './DetailsBox.pcss';

interface DetailsBoxProps {
    group?: string;
    name?: string;
    onClose?: (group?: string, name?: string) => void;
}

const PLACEHOLDER = 'Please enter a name';
const ERROR_GROUP_MISSING = 'Group is required';
const ERROR_NAME_MISSING = 'Name is required';
const ERROR_EXISTS = 'This name already exists';

export function DetailsBox({ group: initialGroup = '', name: initialName = '', onClose }: DetailsBoxProps) {
    const filterGroup = useGroupFilter();

    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup || filterGroup);
    const [name, setName] = useState<string>(initialName);
    const [errors, setErrors] = useState<Record<string, string>>();

    useEffect(() => {
        setErrors(undefined);
    }, [group, name]);

    const groups = useGroups()?.map((v) => v.group) ?? [];
    const hasSameName = useDetails()?.some((d) => !compareNames(group, d.group) && !compareNames(name, d.name));
    const detailsAdded = !initialGroup || !initialName;
    const detailsMoved = !!initialGroup && group !== initialGroup;
    const detailsRenamed = !!initialName && name !== initialName;
    const hasName = hasSameName && !updating && (detailsAdded || detailsMoved || detailsRenamed);
    useEffect(() => {
        if (hasName && isEmpty(errors)) {
            setErrors({ _: ERROR_EXISTS });
        }
    }, [hasName, errors]);

    const groupRef = useRef<HTMLInputElement>(null);

    const nameRef = useRef<HTMLInputElement>(null);
    useEffect(() => nameRef.current?.focus(), []);

    const addDetails = useAddDetails();
    const moveDetails = useMoveDetails();
    const renameDetails = useRenameDetails();
    const handleUpdate = useCallback(async (): Promise<void> => {
        let focusRef = nameRef;
        const newErrors: Record<string, string> = {};
        if (!group) {
            newErrors.group = ERROR_GROUP_MISSING;
            focusRef = groupRef;
        }
        if (!name) {
            newErrors.name = ERROR_NAME_MISSING;
        }
        if (!isEmpty(newErrors)) {
            setErrors(newErrors);
        }
        if (!isEmpty(newErrors) || hasName) {
            focusRef.current?.focus();
            return;
        }
        try {
            setUpdating(true);
            if (!initialName) {
                await addDetails(group, name);
            } else if (detailsMoved) {
                await moveDetails(initialGroup, initialName, group, name);
            } else if (detailsRenamed) {
                await renameDetails(initialGroup, initialName, name);
            }
            onClose?.(group, name);
        } catch (e) {
            setErrors({ _: getErrorMessage(e) });
            nameRef.current?.focus();
        } finally {
            setUpdating(false);
        }
    }, [
        nameRef,
        group,
        name,
        hasName,
        groupRef,
        initialName,
        onClose,
        detailsMoved,
        detailsRenamed,
        moveDetails,
        initialGroup,
        renameDetails,
        addDetails,
    ]);

    const handleClose = useCallback((): void => onClose?.(), [onClose]);

    const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => setName(e.currentTarget.value), []);

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
    const groupLabel = useLabel('Group');
    const titleLabel = useLabel('Title');
    return (
        <Dialog className={cx('DetailsBox')} open onClose={handleClose}>
            <header>
                <div className={cx('title')}>
                    <Label>{initialName ? 'Update entry' : 'Add new entry'}</Label>
                </div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <main>
                <Select
                    ref={groupRef}
                    fullWidth
                    size="large"
                    value={group}
                    label={groupLabel}
                    onChange={(e, value) => setGroup(value as string)}
                    {...(errors?.group && {
                        color: 'red',
                        invalid: true,
                    })}
                >
                    {groups.map((g) => (
                        <Option key={g} value={g}>
                            {g}
                        </Option>
                    ))}
                </Select>
                <Input
                    ref={nameRef}
                    fullWidth
                    size="large"
                    value={name}
                    label={titleLabel}
                    placeholder={useLabel(PLACEHOLDER)}
                    onInput={handleInput}
                    onKeyDown={handleEnter}
                    {...((errors?._ || errors?.name) && {
                        color: 'red',
                        invalid: true,
                    })}
                    {...(errors?._ && {
                        error: errorLabel,
                    })}
                />
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
        if (detailsMoved) {
            return 'Move';
        }
        if (initialName) {
            return 'Update';
        }
        return 'Add';
    }

    function getButtonDecorator() {
        if (detailsMoved) {
            return <MoveIcon />;
        }
        if (initialName) {
            return <DoneIcon />;
        }
        return <AddIcon />;
    }
}
