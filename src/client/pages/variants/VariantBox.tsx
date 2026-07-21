import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconCopy, IconPlus, IconX } from '@tabler/icons-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroups } from '~/client/state/groups/useGroups';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { useRenameVariant } from '~/client/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/client/state/variants/useUpdateVariant';
import { useVariants } from '~/client/state/variants/useVariants';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';
import type { VariantUnits } from '~/types/data';

const UNITS_OPTIONS: { value: VariantUnits; label: string }[] = [
    { value: 'vnt', label: 'vnt' },
    { value: 'ml', label: 'ml' },
    { value: 'l', label: 'l' },
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
];

const DEFAULT_UNITS: VariantUnits = 'vnt';

function deriveVariantKey(count: number | undefined | null | '', units: VariantUnits): string {
    return count ? `${count}${units}` : '';
}

interface VariantBoxProps {
    opened?: boolean;
    group?: string;
    variant?: string;
    name?: string;
    suffix?: string;
    count?: number;
    units?: VariantUnits;
    onClose: (group?: string, variant?: string) => void;
    onAfterClose?: () => void;
}

function resolveInitialName(
    name: string | undefined,
    variant: string,
    count: number | undefined,
    units: VariantUnits
): string {
    if (name !== undefined) return name;
    return count && variant === deriveVariantKey(count, units) ? '' : variant;
}

export function VariantBox({
    group: initialGroup = '',
    variant: initialVariant = '',
    name: initialNameProp,
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
    const initialName = resolveInitialName(initialNameProp, initialVariant, initialCount, initialUnitsResolved);

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
                    return _('Group is required');
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
                        return _('Variant already exists in this group');
                    }
                }
                return null;
            },
            count: (value) => {
                if (!value || value <= 0) {
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
            const nameValue = resolveInitialName(initialNameProp, initialVariant, initialCount, unitsResolved);
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
    }, [
        opened,
        initialGroup,
        initialVariant,
        initialNameProp,
        initialSuffix,
        initialCount,
        initialUnits,
        filterGroup,
        isEditing,
    ]);

    const groupValue = form.values.group;
    const nameValue = form.values.name;
    const countValue = form.values.count;
    const unitsValue = form.values.units;
    useEffect(() => {
        if (formRef.current.isTouched('name') || formRef.current.isTouched('group')) {
            formRef.current.validateField('name');
        }
    }, [groupValue, nameValue, countValue, unitsValue]);

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

            const update: { name?: string; suffix: string; count?: number; units?: VariantUnits } = {
                name: trimmedName !== effectiveVariant ? trimmedName || undefined : undefined,
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

    const handleClose = () => onClose();

    const getButtonContent = () => {
        if (isCopying || (isEditing && form.values.group !== initialGroup)) {
            return {
                icon: <IconCopy size={18} />,
                label: 'Duplicate',
            };
        }
        if (isEditing) {
            return {
                icon: <IconCheck size={18} />,
                label: 'Update',
            };
        }
        return {
            icon: <IconPlus size={18} />,
            label: 'Add',
        };
    };

    const buttonContent = getButtonContent();

    return (
        <Modal
            centered
            opened={!!opened}
            title={_(isEditing ? 'Edit variant' : 'Add new variant')}
            withCloseButton
            onClose={handleClose}
            onExitTransitionEnd={onAfterClose}
            closeOnEscape={!loading}
            closeOnClickOutside={!loading}
            closeButtonProps={{ 'aria-label': _('Close') }}
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Select
                        ref={groupRef}
                        label={_('Group')}
                        placeholder={_('Select group')}
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
                        {...form.getInputProps('name')}
                    />
                    <Group align="flex-start" grow>
                        <NumberInput
                            label={_('Amount')}
                            placeholder={_('e.g. 500')}
                            min={1}
                            disabled={loading}
                            withAsterisk
                            {...form.getInputProps('count')}
                        />
                        <Select
                            label={_('Units')}
                            data={UNITS_OPTIONS}
                            disabled={loading}
                            withAlignedLabels
                            checkIconPosition="left"
                            searchable
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
                            leftSection={<IconX size={18} />}
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
        </Modal>
    );
}
