import { ActionIcon, Button, Group, NumberInput, Select, Stack, TextInput, type ComboboxItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { AddIcon, CancelIcon, DeleteIcon, DuplicateIcon, UpdateIcon, VariantsNavIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { CategoryAvatar } from '~/client/filters/CategoryAvatar';
import { CategoryOption } from '~/client/filters/CategoryOption';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useGroups } from '~/client/state/groups/useGroups';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { useRenameVariant } from '~/client/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/client/state/variants/useUpdateVariant';
import { useVariants } from '~/client/state/variants/useVariants';
import { compareNames } from '~/client/utils/compareNames';
import { DEFAULT_UNITS, deriveVariantKey } from '~/client/utils/deriveVariantKey';
import { getErrorMessage } from '~/client/utils/errors';
import type { VariantUnits } from '~/types/data';

const UNITS_OPTIONS: { value: VariantUnits; label: string }[] = [
    { value: 'vnt', label: 'vnt' },
    { value: 'l', label: 'l' },
    { value: 'kg', label: 'kg' },
];

const MIN_COUNT = 0.001;
const NEW_CATEGORY_VALUE = ':new-category';

interface VariantBoxProps {
    opened?: boolean;
    group?: string;
    variant?: string;
    suffix?: string;
    count?: number;
    units?: VariantUnits;
    onClose: (group?: string, variant?: string) => void;
    onAfterClose?: () => void;
    onDelete?: () => void;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
}

function resolveInitialName(variant: string, count: number | undefined, units: VariantUnits): string {
    return count && variant === deriveVariantKey(count, units) ? '' : variant;
}

export function VariantBox({
    group: initialGroup = '',
    variant: initialVariant = '',
    suffix: initialSuffix = '',
    count: initialCount,
    units: initialUnits,
    opened,
    onClose,
    onAfterClose,
    onDelete,
    closeOnEscape = true,
    closeOnClickOutside = true,
}: Readonly<VariantBoxProps>) {
    const [filterGroup] = useGroupFilter();
    const isEditing = !!initialGroup && !!initialVariant;
    const isCopying = isEditing && filterGroup && filterGroup !== initialGroup;

    const _ = useLabels();
    const allGroups = useGroups();
    const groups = allGroups.map((g) => g.group);
    const imageByGroup = new Map(allGroups.map((g) => [g.group, g.image]));
    const categoryOptions = useMemo(
        () => [...groups.map((g) => ({ value: g, label: g })), { value: NEW_CATEGORY_VALUE, label: _('New category') }],
        [groups, _]
    );
    const variants = useVariants();

    const initialUnitsResolved = initialUnits ?? DEFAULT_UNITS;
    const initialName = resolveInitialName(initialVariant, initialCount, initialUnitsResolved);

    const form = useForm({
        initialValues: {
            group: initialGroup || filterGroup || '',
            name: initialName,
            suffix: initialSuffix,
            count: initialCount as number | undefined,
            units: initialUnitsResolved,
        },
        validate: {
            group: (value) => {
                if (!value?.trim()) {
                    return _('Category is required');
                }
                return null;
            },
            name: (value, values) => {
                const trimmed = value.trim();

                if (trimmed && trimmed.includes(':')) {
                    return _('Cannot contain ":" character');
                }

                const effectiveVariant = trimmed || deriveVariantKey(values.count, values.units);
                if (!effectiveVariant) {
                    return _('Variant name or amount is required');
                }

                const variantAdded = !initialVariant;
                const variantCopied = isEditing && values.group !== initialGroup;
                const variantRenamed =
                    isEditing && effectiveVariant !== initialVariant && values.group === initialGroup;

                if (variantAdded || variantCopied || variantRenamed) {
                    const variantExists = variants?.some(
                        (v) => !compareNames(v.group, values.group) && !compareNames(v.variant, effectiveVariant)
                    );
                    if (variantExists) {
                        return _('Variant already exists in this category');
                    }
                }
                return null;
            },
            count: (value, values) => {
                if (values.name?.trim()) {
                    return null;
                }
                if (!value || value < MIN_COUNT) {
                    return _('Amount is required');
                }
                return null;
            },
        },
    });

    const formRef = useRef(form);
    useLayoutEffect(() => {
        formRef.current = form;
    });

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const groupRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (opened) {
            const unitsResolved = initialUnits ?? DEFAULT_UNITS;
            const nameValue = resolveInitialName(initialVariant, initialCount, unitsResolved);
            formRef.current.setValues({
                group: initialGroup || filterGroup || '',
                name: nameValue,
                suffix: initialSuffix,
                count: initialCount,
                units: unitsResolved,
            });
            formRef.current.resetTouched();
            formRef.current.resetDirty();
            // oxlint-disable-next-line react/set-state-in-effect -- submission state reset when modal opens
            setSubmitting(false);
            setLoading(false);

            const timer = setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [opened, initialGroup, initialVariant, initialSuffix, initialCount, initialUnits, filterGroup, isEditing]);

    const groupValue = form.values.group;
    const nameValue = form.values.name;
    const countValue = form.values.count;
    const unitsValue = form.values.units;
    useEffect(() => {
        if (formRef.current.isTouched('name') || formRef.current.isTouched('group')) {
            formRef.current.validateField('name');
        }
        if (formRef.current.isTouched('count')) {
            formRef.current.validateField('count');
        }
    }, [groupValue, nameValue, countValue, unitsValue]);

    const nameHasValue = !!nameValue?.trim();
    const countHasValue = !!countValue;
    const showNameAsterisk = nameHasValue || !countHasValue;
    const showCountAsterisk = countHasValue || !nameHasValue;

    const updateVariant = useUpdateVariant();
    const renameVariant = useRenameVariant();
    const copyVariant = useCopyVariant();

    const [addingCategory, setAddingCategory] = useState(false);
    const handleAddCategoryOpen = useCallback(() => setAddingCategory(true), []);
    const handleAddCategoryClose = useCallback((newGroup?: string) => {
        setAddingCategory(false);
        if (newGroup) {
            formRef.current.setFieldValue('group', newGroup);
        }
    }, []);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Whenever count has an error, name does too (an empty name + invalid count both fail
            // the name validator's "variant name or amount is required" check) - so if group has
            // no error, name always does.
            if (validation.errors.group) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                groupRef.current?.focus();
            } else {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                nameRef.current?.focus();
            }
            return;
        }

        setSubmitting(true);
        // Delay the loader to avoid flashing it for fast operations. The submit button is
        // disabled immediately via `submitting`, so the request cannot be started twice.
        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            const values = form.values;
            const trimmedName = values.name.trim();
            const effectiveVariant = trimmedName || deriveVariantKey(values.count, values.units);
            const groupChanged = isEditing && values.group !== initialGroup;
            const variantRenamed = isEditing && effectiveVariant !== initialVariant && !groupChanged;
            const suffixChanged = values.suffix !== initialSuffix;
            const countChanged = values.count !== initialCount;
            const unitsChanged = values.units !== initialUnitsResolved;
            const nameChanged = trimmedName !== initialName;

            const update: { suffix: string; count?: number; units?: VariantUnits } = {
                suffix: values.suffix,
            };
            if (values.count) {
                update.count = values.count;
                update.units = values.units;
            }

            if (groupChanged) {
                await copyVariant(initialGroup, initialVariant, values.group, effectiveVariant, update);
            } else if (variantRenamed) {
                await renameVariant(initialGroup, initialVariant, effectiveVariant, update);
            } else if (!isEditing || suffixChanged || countChanged || unitsChanged || nameChanged) {
                await updateVariant(values.group, effectiveVariant, update);
            }
            onClose(values.group, effectiveVariant);
        } catch (error) {
            form.setFieldError('name', getErrorMessage(error));
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            nameRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setSubmitting(false);
            setLoading(false);
        }
    };

    const getButtonContent = () => {
        if (isCopying || (isEditing && form.values.group !== initialGroup)) {
            return {
                icon: <DuplicateIcon size={18} />,
                label: 'Duplicate',
            };
        }
        if (isEditing) {
            return {
                icon: <UpdateIcon size={18} />,
                label: 'Update',
            };
        }
        return {
            icon: <AddIcon size={18} />,
            label: 'Add',
        };
    };

    const buttonContent = getButtonContent();

    return (
        <>
            <ConfirmableModal
                centered
                opened={!!opened}
                title={
                    <DialogIcon aria-label={_(isEditing ? 'Edit variant' : 'Add new variant')}>
                        <VariantsNavIcon />
                    </DialogIcon>
                }
                withCloseButton
                isDirty={() => formRef.current.isDirty()}
                onClose={() => onClose()}
                onExitTransitionEnd={onAfterClose}
                closeOnEscape={!loading && closeOnEscape}
                closeOnClickOutside={!loading && closeOnClickOutside}
                closeButtonProps={{ 'aria-label': _('Close') }}
            >
                {(handleClose) => (
                    <form onSubmit={handleSubmit}>
                        <Stack>
                            <Select
                                ref={groupRef}
                                label={_('Category')}
                                placeholder={_('Select category')}
                                data={categoryOptions}
                                renderOption={({ option }: { option: ComboboxItem }) =>
                                    option.value === NEW_CATEGORY_VALUE ? (
                                        <Group gap="xs" data-separator={!!groups.length}>
                                            <AddIcon size={14} />
                                            {option.label}
                                        </Group>
                                    ) : (
                                        <CategoryOption option={option} image={imageByGroup.get(option.value)} />
                                    )
                                }
                                leftSection={
                                    form.values.group ? (
                                        <CategoryAvatar
                                            image={imageByGroup.get(form.values.group)}
                                            label={form.values.group}
                                        />
                                    ) : undefined
                                }
                                withAsterisk
                                withAlignedLabels
                                checkIconPosition="left"
                                disabled={loading}
                                searchable
                                {...form.getInputProps('group')}
                                onChange={(value) =>
                                    value === NEW_CATEGORY_VALUE
                                        ? handleAddCategoryOpen()
                                        : form.setFieldValue('group', value ?? '')
                                }
                            />
                            <TextInput
                                ref={nameRef}
                                label={_('Variant name')}
                                placeholder={_('Enter variant name')}
                                disabled={loading}
                                withAsterisk={showNameAsterisk}
                                {...form.getInputProps('name')}
                            />
                            <Group align="flex-start" grow>
                                <NumberInput
                                    label={_('Amount')}
                                    placeholder={_('e.g. 500')}
                                    min={MIN_COUNT}
                                    disabled={loading}
                                    withAsterisk={showCountAsterisk}
                                    {...form.getInputProps('count')}
                                    error={!!form.errors.count}
                                />
                                <Select
                                    label={_('Units')}
                                    data={UNITS_OPTIONS}
                                    disabled={loading}
                                    withAlignedLabels
                                    checkIconPosition="left"
                                    searchable
                                    allowDeselect={false}
                                    {...form.getInputProps('units')}
                                />
                            </Group>
                            <TextInput
                                label={_('Suffix')}
                                placeholder={_('Enter suffix')}
                                disabled={loading}
                                {...form.getInputProps('suffix')}
                            />
                            <Group justify={isEditing && onDelete ? 'space-between' : 'flex-end'} mt="md" wrap="nowrap">
                                {isEditing && onDelete && (
                                    <ActionIcon
                                        variant="outline"
                                        color="negative"
                                        size="lg"
                                        disabled={loading}
                                        onClick={onDelete}
                                        aria-label={_('Remove')}
                                    >
                                        <DeleteIcon size={18} />
                                    </ActionIcon>
                                )}
                                <Group gap="sm" wrap="nowrap">
                                    <Button
                                        variant="outline"
                                        color="gray"
                                        disabled={loading}
                                        leftSection={<CancelIcon size={18} />}
                                        onClick={handleClose}
                                    >
                                        <Label>Cancel</Label>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        loading={loading}
                                        leftSection={buttonContent.icon}
                                        color={!isEditing ? 'positive' : undefined}
                                    >
                                        <Label>{buttonContent.label}</Label>
                                    </Button>
                                </Group>
                            </Group>
                        </Stack>
                    </form>
                )}
            </ConfirmableModal>
            {addingCategory && <GroupBox opened onClose={handleAddCategoryClose} />}
        </>
    );
}
