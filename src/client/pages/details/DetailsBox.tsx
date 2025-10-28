import React, { useEffect, useRef, useState } from 'react';

import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconCheck, IconPlus, IconX } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useLabels } from '~/client/hooks/useLabels';
import { useAddDetails } from '~/client/state/details/useAddDetails';
import { useDetails } from '~/client/state/details/useDetails';
import { useMoveDetails } from '~/client/state/details/useMoveDetails';
import { useRenameDetails } from '~/client/state/details/useRenameDetails';
import { useGroups } from '~/client/state/groups/useGroups';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';

interface DetailsBoxProps {
    opened?: boolean;
    group?: string;
    name?: string;
    onClose?: (group?: string, name?: string) => void;
    onAfterClose?: () => void;
}

export function DetailsBox({
    group: initialGroup = '',
    name: initialName = '',
    opened = false,
    onClose,
    onAfterClose,
}: Readonly<DetailsBoxProps>) {
    const filterGroup = useGroupFilter();
    const isEditing = !!initialGroup && !!initialName;
    const isMoving = isEditing && filterGroup && filterGroup !== initialGroup;

    const _ = useLabels();
    const groups = useGroups()?.map((g) => g.group) ?? [];
    const details = useDetails();

    const form = useForm({
        initialValues: {
            group: initialGroup || filterGroup || '',
            name: initialName,
        },
        validate: {
            group: (value) => {
                if (!value?.trim()) {
                    return _('Group is required');
                }
                if (value.includes(':')) {
                    return _('Cannot contain ":" character');
                }
                return null;
            },
            name: (value, values) => {
                if (!value?.trim()) {
                    return _('Name is required');
                }
                if (value.includes(':')) {
                    return _('Cannot contain ":" character');
                }
                // Check if name exists in the selected group
                const nameExists = details?.some(
                    (d) => !compareNames(d.group, values.group) && !compareNames(d.name, value)
                );
                const nameAdded = !initialName;
                const nameCopied = isEditing && values.group !== initialGroup;
                const nameRenamed = isEditing && value !== initialName && values.group === initialGroup;

                if (nameExists && (nameAdded || nameCopied || nameRenamed)) {
                    return _('Name already exists in this group');
                }
                return null;
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const groupRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            form.setValues({
                group: initialGroup || filterGroup || '',
                name: initialName,
            });
            form.resetTouched();
            form.resetDirty();
            setLoading(false);

            const timer = setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, initialGroup, initialName]);

    // Revalidate when group or name changes to show duplicate errors in real-time
    useEffect(() => {
        if (form.isTouched('name') || form.isTouched('group')) {
            form.validateField('name');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.group, form.values.name]);

    const addDetails = useAddDetails();
    const moveDetails = useMoveDetails();
    const renameDetails = useRenameDetails();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            if (validation.errors.group) {
                groupRef.current?.focus();
            } else if (validation.errors.name) {
                nameRef.current?.focus();
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
            const nameRenamed = isEditing && values.name !== initialName && !groupChanged;

            if (groupChanged) {
                // Move to different group
                await moveDetails(initialGroup, initialName, values.group, values.name);
            } else if (nameRenamed) {
                // Rename in same group
                await renameDetails(initialGroup, initialName, values.name);
            } else if (!isEditing) {
                // Add new
                await addDetails(values.group, values.name);
            }
            onClose?.(values.group, values.name);
        } catch (error) {
            form.setFieldError('name', getErrorMessage(error));
            nameRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    const handleClose = () => onClose?.();

    // Determine button content
    const getButtonContent = () => {
        if (isMoving || (isEditing && form.values.group !== initialGroup)) {
            return {
                icon: <IconArrowRight size={18} />,
                label: 'Move',
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
            opened={opened}
            title={_(isEditing ? 'Edit entry' : 'Add new entry')}
            withCloseButton
            onClose={handleClose}
            closeOnEscape={!loading}
            closeOnClickOutside={!loading}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={onAfterClose}
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
                        ref={nameRef}
                        label={_('Title')}
                        placeholder={_('Enter name')}
                        withAsterisk
                        disabled={loading}
                        {...form.getInputProps('name')}
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
