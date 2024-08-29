import AddIcon from '@icons/Add.svg';
import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DoneIcon from '@icons/Done.svg';
import MoveIcon from '@icons/MoveItem.svg';
import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { useFocusRef } from '@ui/hooks/useFocusRef';
import { Input } from '@ui/Input';
import { Option, Select } from '@ui/Select';
import { isEmpty } from 'lodash';
import React, { type FormEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Label } from '~/client/common/Label';
import { type WithOnClose } from '~/client/common/WithOnClose';
import { useLabel } from '~/client/hooks/useLabel';
import { useNameMatch } from '~/client/hooks/useNameMatch';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useMoveDetails } from '~/state/details/useMoveDetails';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { useGroups } from '~/state/groups/useGroups';
import { getErrorMessage } from '~/utils/errors';
import cx from './DetailsBox.less';

interface DetailsBoxProps extends WithOnClose {
    group?: string;
    name?: string;
    onClose: (group?: string, name?: string) => void;
}

const PLACEHOLDER = 'Please enter a name';
const ERROR_GROUP_MISSING = 'Group is required';
const ERROR_NAME_MISSING = 'Name is required';
const ERROR_EXISTS = 'This name already exists';

export function DetailsBox({ group: initialGroup = '', name: initialName = '', onClose }: DetailsBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup);
    const [name, setName] = useState<string>(initialName);
    const [errors, setErrors] = useState<Record<string, string>>();

    useEffect(() => {
        setErrors(undefined);
    }, [group, name]);

    const groups = useGroups()?.map((v) => v.group) ?? [];
    const hasSameName = useNameMatch(group, name);
    const detailsMoved = group !== initialGroup;
    const detailsRenamed = name !== initialName;
    const hasName = hasSameName && (detailsMoved || detailsRenamed) && !updating;
    useEffect(() => {
        if (hasName && isEmpty(errors)) {
            setErrors({ '': ERROR_EXISTS });
        }
    }, [hasName, errors]);

    const groupRef = useFocusRef<HTMLInputElement>();
    const nameRef = useAutoFocus<HTMLInputElement>();

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
            focusRef?.focus();
            return;
        }
        try {
            setUpdating(true);
            if (initialName) {
                if (detailsMoved) {
                    await moveDetails(initialGroup, initialName, group, name);
                } else if (detailsRenamed) {
                    await renameDetails(initialGroup, initialName, name);
                }
            } else {
                await addDetails(initialGroup, name);
            }
            onClose(group, name);
        } catch (e) {
            setErrors({ '': getErrorMessage(e) });
            nameRef?.focus();
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

    const handleClose = useCallback((): void => onClose(), [onClose]);

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
    const errorLabel = useLabel(errors?.[''] ?? '');
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
                    onChange={(value) => setGroup(value as string)}
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
                    color={errors?.[''] || errors?.name ? 'negative' : 'primary'}
                    error={errors?.[''] ? errorLabel : undefined}
                    size="large"
                    value={name}
                    label={titleLabel}
                    placeholder={useLabel(PLACEHOLDER)}
                    onInput={handleInput}
                    onKeyDown={handleEnter}
                />
            </main>
            <footer>
                <Button variant="outlined" startDecorator={<CancelIcon />} onClick={handleClose}>
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="primary" startDecorator={getButtonDecorator()} onClick={handleUpdate}>
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
