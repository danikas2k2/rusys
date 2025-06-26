import React, { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import AddIcon from '@assets/add.svg';
import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import CopyIcon from '@assets/content-copy.svg';
import DoneIcon from '@assets/done.svg';
import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { useFocusRef } from '@ui/hooks/useFocusRef';
import { Input } from '@ui/Input';
import { Option, Select } from '@ui/Select';
import { Label } from '~/client/common/Label';
import { type WithOnClose } from '~/client/common/WithOnClose';
import { useLabel } from '~/client/hooks/useLabel';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/common/utils/errors';
import { useGroups } from '~/state/groups/useGroups';
import { useCopyVariant } from '~/state/variants/useCopyVariant';
import { useRenameVariant } from '~/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/state/variants/useUpdateVariant';
import { useVariant } from '~/state/variants/useVariant';
import { useVariants } from '~/state/variants/useVariants';
import { type Variant } from '~/types/data';
import { isEmpty } from 'lodash';
import cx from './VariantBox.pcss';

interface VariantBoxProps extends WithOnClose {
    group?: string;
    variant?: string;
    onClose: (group?: string, variant?: string) => void;
}

const PLACEHOLDER = 'Please enter a name';
const ERROR_GROUP_MISSING = 'Group is required';
const ERROR_NAME_MISSING = 'Name is required';
const ERROR_EXISTS = 'Variant already exists';

export function VariantBox({ group: initialGroup = '', variant: initialVariant = '', onClose }: VariantBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup);
    const [variant, setVariant] = useState<string>(initialVariant);
    const variantDetails = useVariant(initialGroup, initialVariant);
    const { suffix: initialSuffix = '' } = variantDetails ?? ({} as Variant);
    const [suffix, setSuffix] = useState<string>(initialSuffix);
    const [errors, setErrors] = useState<Record<string, string>>();

    useEffect(() => {
        setErrors(undefined);
    }, [group, variant]);

    const groups = useGroups()?.map((v) => v.group) ?? [];
    const hasSameVariant = useVariants()?.some(
        (v) => !compareNames(v.group, group) && !compareNames(v.variant, variant)
    );
    const variantAdded = !initialGroup || !initialVariant;
    const variantCopied = !!initialGroup && group !== initialGroup;
    const variantRenamed = !!initialVariant && variant !== initialVariant;
    const hasVariant = hasSameVariant && !updating && (variantAdded || variantCopied || variantRenamed);

    useEffect(() => {
        if (hasVariant && isEmpty(errors)) {
            setErrors({ _: ERROR_EXISTS });
        }
    }, [hasVariant, errors]);

    const groupRef = useFocusRef<HTMLInputElement>();
    const nameRef = useAutoFocus<HTMLInputElement>();

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
            const update = { suffix };
            if (!initialVariant) {
                await updateVariant(group, variant, update);
            } else if (variantCopied) {
                await copyVariant(initialGroup, initialVariant, group, variant, update);
            } else if (variantRenamed) {
                await renameVariant(initialGroup, initialVariant, variant, update);
            } else if (initialSuffix !== suffix) {
                await updateVariant(group, variant, update);
            }
            onClose(group, variant);
        } catch (e) {
            setErrors({ _: getErrorMessage(e) });
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
        suffix,
        initialVariant,
        variantCopied,
        variantRenamed,
        initialSuffix,
        onClose,
        updateVariant,
        copyVariant,
        initialGroup,
        renameVariant,
    ]);

    const handleClose = useCallback((): void => onClose(), [onClose]);

    const handleVariantInput = useCallback((e: FormEvent<HTMLInputElement>) => setVariant(e.currentTarget.value), []);
    const handleShortInput = useCallback((e: FormEvent<HTMLInputElement>) => setSuffix(e.currentTarget.value), []);

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
    const variantLabel = useLabel('Variant');
    const suffixLabel = useLabel('Suffix');

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
                    color={errors?.group ? 'red' : 'blue'}
                    invalid={!!errors?.group}
                    size="large"
                    value={group}
                    label={groupLabel}
                    onChange={(e, value) => setGroup(value as string)}
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
                    color={errors?._ || errors?.variant ? 'red' : 'blue'}
                    invalid={!!errors?._ || !!errors?.variant}
                    error={errors?._ ? errorLabel : undefined}
                    size="large"
                    value={variant}
                    label={variantLabel}
                    placeholder={useLabel(PLACEHOLDER)}
                    onInput={handleVariantInput}
                    onKeyDown={handleEnter}
                />
                <Input
                    fullWidth
                    size="large"
                    value={suffix}
                    label={suffixLabel}
                    onInput={handleShortInput}
                    onKeyDown={handleEnter}
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
