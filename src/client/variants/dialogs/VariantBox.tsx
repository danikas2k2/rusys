import AddIcon from '@icons/Add.svg';
import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import CopyIcon from '@icons/ContentCopy.svg';
import DoneIcon from '@icons/Done.svg';
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
import { compareNames } from '~/client/utils/compareNames';
import { type Variant } from '~/common/types';
import { useGroups } from '~/state/groups/useGroups';
import { useAddVariant } from '~/state/variants/useAddVariant';
import { useCopyVariant } from '~/state/variants/useCopyVariant';
import { useRenameVariant } from '~/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/state/variants/useUpdateVariant';
import { useVariant } from '~/state/variants/useVariant';
import { useVariants } from '~/state/variants/useVariants';
import { getErrorMessage } from '~/utils/errors';
import cx from './VariantBox.less';

interface VariantBoxProps extends WithOnClose {
    group?: string;
    variant?: string;
    onClose: (group?: string, variant?: string) => void;
}

const ERROR_GROUP_MISSING = 'Group is required';
const ERROR_NAME_MISSING = 'Name is required';
const ERROR_EXISTS = 'Variant already exists';

export function VariantBox({ group: initialGroup = '', variant: initialVariant = '', onClose }: VariantBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup);
    const [variant, setVariant] = useState<string>(initialVariant);
    const variantDetails = useVariant(initialGroup, initialVariant);
    const { long: initialLong, short: initialShort } = variantDetails ?? ({} as Variant);
    const [longTitle, setLongTitle] = useState<string>(initialLong ?? '');
    const [shortTitle, setShortTitle] = useState<string>(initialShort ?? '');
    const [errors, setErrors] = useState<Record<string, string>>();

    useEffect(() => {
        setErrors(undefined);
    }, [group, variant]);

    const groups = useGroups()?.map((v) => v.group) ?? [];
    const hasSameVariant = useVariants()?.some(
        (v) => !compareNames(v.group, group) && !compareNames(v.variant, variant)
    );
    const variantCopied = group !== initialGroup;
    const variantRenamed = variant !== initialVariant;
    const hasVariant = hasSameVariant && (variantCopied || variantRenamed) && !updating;
    useEffect(() => {
        if (hasVariant && isEmpty(errors)) {
            setErrors({ '': ERROR_EXISTS });
        }
    }, [hasVariant, errors]);

    const groupRef = useFocusRef<HTMLInputElement>();
    const nameRef = useAutoFocus<HTMLInputElement>();

    const addVariant = useAddVariant();
    const copyVariant = useCopyVariant();
    const renameVariant = useRenameVariant();
    const updateVariant = useUpdateVariant();
    const handleUpdate = useCallback(async (): Promise<void> => {
        let focusRef = nameRef;
        const newErrors: Record<string, string> = {};
        if (!group) {
            newErrors.group = ERROR_GROUP_MISSING;
            focusRef = groupRef;
        }
        if (!variant) {
            newErrors.variant = ERROR_NAME_MISSING;
        }
        if (!isEmpty(newErrors)) {
            setErrors(newErrors);
        }
        if (!isEmpty(newErrors) || hasVariant) {
            focusRef?.focus();
            return;
        }
        try {
            setUpdating(true);
            if (initialVariant) {
                const update = {
                    long: longTitle,
                    short: shortTitle,
                };
                if (variantCopied) {
                    await copyVariant(initialGroup, initialVariant, group, variant, update);
                } else if (variantRenamed) {
                    await renameVariant(initialGroup, initialVariant, variant, update);
                } else if (initialLong !== longTitle || initialShort !== shortTitle) {
                    await updateVariant(group, variant, {
                        long: longTitle,
                        short: shortTitle,
                    });
                }
            } else {
                await addVariant(group, variant, {
                    long: longTitle,
                    short: shortTitle,
                });
            }
            onClose(group, variant);
        } catch (e) {
            setErrors({ '': getErrorMessage(e) });
            nameRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [
        nameRef,
        group,
        variant,
        hasVariant,
        groupRef,
        initialVariant,
        onClose,
        longTitle,
        shortTitle,
        variantCopied,
        variantRenamed,
        initialLong,
        initialShort,
        copyVariant,
        initialGroup,
        renameVariant,
        updateVariant,
        addVariant,
    ]);

    const handleClose = useCallback((): void => onClose(), [onClose]);

    const handleVariantInput = useCallback((e: FormEvent<HTMLInputElement>) => setVariant(e.currentTarget.value), []);
    const handleLongInput = useCallback((e: FormEvent<HTMLInputElement>) => setLongTitle(e.currentTarget.value), []);
    const handleShortInput = useCallback((e: FormEvent<HTMLInputElement>) => setShortTitle(e.currentTarget.value), []);

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
    const variantLabel = useLabel('Variant name');
    const longLabel = useLabel('Long label');
    const shortLabel = useLabel('Short label');

    return (
        <Dialog className={cx('VariantBox')} open onClose={handleClose}>
            <header>
                <div className={cx('title')}>
                    <Label>{initialVariant ? 'Edit variant' : 'Add new variant'}</Label>
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
                    color={errors?.[''] || errors?.variant ? 'negative' : 'primary'}
                    error={errors?.[''] ? errorLabel : undefined}
                    size="large"
                    value={variant}
                    label={variantLabel}
                    onInput={handleVariantInput}
                    onKeyDown={handleEnter}
                />
                <Input
                    fullWidth
                    size="large"
                    value={longTitle}
                    label={longLabel}
                    onInput={handleLongInput}
                    onKeyDown={handleEnter}
                />
                <Input
                    fullWidth
                    size="large"
                    value={shortTitle}
                    label={shortLabel}
                    onInput={handleShortInput}
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
        if (variantCopied) {
            return 'Duplicate';
        }
        if (initialVariant) {
            return 'Update';
        }
        return 'Add';
    }

    function getButtonDecorator() {
        if (variantCopied) {
            return <CopyIcon />;
        }
        if (initialVariant) {
            return <DoneIcon />;
        }
        return <AddIcon />;
    }
}
