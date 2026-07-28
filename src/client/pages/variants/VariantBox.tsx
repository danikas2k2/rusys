import { Button, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AddIcon, CancelIcon, DuplicateIcon, UpdateIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
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

interface VariantBoxProps {
    opened?: boolean;
    group?: string;
    variant?: string;
    suffix?: string;
    count?: number;
    units?: VariantUnits;
    onClose: (group?: string, variant?: string) => void;
    onAfterClose?: () => void;
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
}: Readonly<VariantBoxProps>) {
    const [filterGroup] = useGroupFilter();
    const isEditing = !!initialGroup && !!initialVariant;
    const isCopying = isEditing && filterGroup && filterGroup !== initialGroup;

    const _ = useLabels();
    const groups = useGroups()?.map((g) => g.group) ?? [];
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
                const trimmed = value?.trim() ?? '';

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
            // eslint-disable-next-line react-hooks/set-state-in-effect -- loading reset when modal opens
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

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            if (validation.errors.group) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                groupRef.current?.focus();
            } else if (validation.errors.name) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                nameRef.current?.focus();
            }
            return;
        }

        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            const values = form.values;
            const trimmedName = values.name?.trim() ?? '';
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
        <ConfirmableModal
            centered
            opened={!!opened}
            title={_(isEditing ? 'Edit variant' : 'Add new variant')}
            withCloseButton
            isDirty={() => formRef.current.isDirty()}
            onClose={() => onClose()}
            onExitTransitionEnd={onAfterClose}
            closeOnEscape={!loading}
            closeOnClickOutside={!loading}
            closeButtonProps={{ 'aria-label': _('Close') }}
        >
            {(handleClose) => (
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <Select
                            ref={groupRef}
                            label={_('Category')}
                            placeholder={_('Select category')}
                            data={groups}
                            withAsterisk
                            withAlignedLabels
                            checkIconPosition="left"
                            disabled={loading}
                            searchable
                            {...form.getInputProps('group')}
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
                        <Group justify="flex-end" mt="md">
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
                                loading={loading}
                                leftSection={buttonContent.icon}
                                color={!isEditing ? 'positive' : undefined}
                            >
                                <Label>{buttonContent.label}</Label>
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </ConfirmableModal>
    );
}
