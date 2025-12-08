import React, { useEffect, useRef, useState } from 'react';

import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconCopy, IconPlus, IconX } from '@tabler/icons-react';

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

interface VariantBoxProps {
    opened?: boolean;
    group?: string;
    variant?: string;
    suffix?: string;
    onClose: (group?: string, variant?: string) => void;
    onAfterClose?: () => void;
}

export function VariantBox({
    group: initialGroup = '',
    variant: initialVariant = '',
    suffix: initialSuffix = '',
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

    const form = useForm({
        initialValues: {
            group: initialGroup || filterGroup || '',
            variant: initialVariant,
            suffix: initialSuffix,
        },
        validate: {
            group: (value) => {
                if (!value?.trim()) {
                    return _('Group is required');
                }
                return null;
            },
            variant: (value, values) => {
                if (!value?.trim()) {
                    return _('Variant name is required');
                }
                if (value.includes(':')) {
                    return _('Cannot contain ":" character');
                }
                // Check if variant exists in the selected group
                const variantExists = variants?.some(
                    (v) => !compareNames(v.group, values.group) && !compareNames(v.variant, value)
                );
                const variantAdded = !initialVariant;
                const variantCopied = isEditing && values.group !== initialGroup;
                const variantRenamed = isEditing && value !== initialVariant && values.group === initialGroup;

                if (variantExists && (variantAdded || variantCopied || variantRenamed)) {
                    return _('Variant already exists in this group');
                }
                return null;
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const groupRef = useRef<HTMLInputElement>(null);
    const variantRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            form.setValues({
                group: initialGroup || filterGroup || '',
                variant: initialVariant,
                suffix: initialSuffix,
            });
            form.resetTouched();
            form.resetDirty();
            setLoading(false);

            const timer = setTimeout(() => {
                variantRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, initialGroup, initialVariant, initialSuffix]);

    // Revalidate when group or variant changes to show duplicate errors in real-time
    useEffect(() => {
        if (form.isTouched('variant') || form.isTouched('group')) {
            form.validateField('variant');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.group, form.values.variant]);

    const updateVariant = useUpdateVariant();
    const renameVariant = useRenameVariant();
    const copyVariant = useCopyVariant();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            if (validation.errors.group) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                groupRef.current?.focus();
            } else if (validation.errors.variant) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                variantRef.current?.focus();
            }
            return;
        }

        // Delay loading state to avoid showing it for fast operations
        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            const values = form.values;
            const groupChanged = isEditing && values.group !== initialGroup;
            const variantRenamed = isEditing && values.variant !== initialVariant && !groupChanged;
            const suffixChanged = values.suffix !== initialSuffix;

            if (groupChanged) {
                // Copy to different group
                await copyVariant(initialGroup, initialVariant, values.group, values.variant, {
                    suffix: values.suffix,
                });
            } else if (variantRenamed) {
                // Rename in same group
                await renameVariant(initialGroup, initialVariant, values.variant, { suffix: values.suffix });
            } else if (!isEditing || suffixChanged) {
                // Add new or update suffix
                await updateVariant(values.group, values.variant, { suffix: values.suffix });
            }
            onClose(values.group, values.variant);
        } catch (error) {
            form.setFieldError('variant', getErrorMessage(error));
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            variantRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    const handleClose = () => onClose();

    // Determine button content
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
                        disabled={loading}
                        searchable
                        {...form.getInputProps('group')}
                    />
                    <TextInput
                        ref={variantRef}
                        label={_('Variant name')}
                        placeholder={_('Enter variant name')}
                        withAsterisk
                        disabled={loading}
                        {...form.getInputProps('variant')}
                    />
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
                            color={!isEditing ? 'green' : undefined}
                        >
                            <Label>{buttonContent.label}</Label>
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
