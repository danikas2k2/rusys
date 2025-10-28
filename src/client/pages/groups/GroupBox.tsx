import React, { useEffect, useRef, useState } from 'react';

import { Button, Checkbox, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCalendarClock, IconCheck, IconPlus, IconX } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroups } from '~/client/state/groups/useGroups';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';

interface GroupBoxProps {
    opened?: boolean;
    group?: string;
    annual?: boolean;
    onClose?: (group?: string) => void;
    onAfterClose?: () => void;
}

export function GroupBox({
    group: initialGroup = '',
    annual: initialAnnual = true,
    opened,
    onClose,
    onAfterClose,
}: GroupBoxProps) {
    const isEditing = !!initialGroup;

    const _ = useLabels();
    const groups = useGroups();

    const form = useForm({
        initialValues: {
            group: initialGroup,
            annual: initialAnnual,
        },
        validate: {
            group: (value) => {
                if (!value?.trim()) {
                    return _('Name is required');
                }
                if (value.includes(':')) {
                    return _('Cannot contain ":" character');
                }
                // Check if group exists (for new groups or renamed groups)
                const groupExists = groups?.some((g) => !compareNames(g.group, value));
                const groupAdded = !initialGroup;
                const groupRenamed = !!initialGroup && value !== initialGroup;

                if (groupExists && (groupAdded || groupRenamed)) {
                    return _('Group already exists');
                }
                return null;
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            form.setValues({
                group: initialGroup,
                annual: initialAnnual,
            });
            form.resetTouched();
            form.resetDirty();
            setLoading(false);

            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, initialGroup, initialAnnual]);

    // Revalidate when group name changes to show duplicate errors in real-time
    useEffect(() => {
        if (form.isTouched('group')) {
            form.validateField('group');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.group]);

    const updateGroup = useUpdateGroup();
    const renameGroup = useRenameGroup();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            inputRef.current?.focus();
            return;
        }

        // Delay loading state to avoid showing it for fast operations
        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            const values = form.values;
            const groupRenamed = isEditing && values.group !== initialGroup;
            const annualChanged = values.annual !== initialAnnual;

            if (groupRenamed) {
                await renameGroup(initialGroup, values.group, values.annual);
            } else if (!isEditing || annualChanged) {
                await updateGroup(values.group, values.annual);
            }
            onClose?.(values.group);
        } catch (error) {
            form.setFieldError('group', getErrorMessage(error));
            inputRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    const handleClose = () => onClose?.();

    return (
        <Modal
            centered
            opened={!!opened}
            title={_(isEditing ? 'Edit group' : 'Add new group')}
            withCloseButton
            onClose={handleClose}
            onExitTransitionEnd={onAfterClose}
            closeOnEscape={!loading}
            closeOnClickOutside={!loading}
            closeButtonProps={{ 'aria-label': _('Close') }}
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <TextInput
                        ref={inputRef}
                        label={_('Group name')}
                        placeholder={_('Enter group name')}
                        withAsterisk
                        disabled={loading}
                        {...form.getInputProps('group')}
                    />
                    <Checkbox
                        variant="outline"
                        label={
                            <Group gap="xs">
                                <IconCalendarClock size={18} />
                                <Label>Annual</Label>
                            </Group>
                        }
                        disabled={loading}
                        {...form.getInputProps('annual', { type: 'checkbox' })}
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
                            leftSection={isEditing ? <IconCheck size={18} /> : <IconPlus size={18} />}
                            color={!isEditing ? 'green' : undefined}
                        >
                            <Label>{isEditing ? 'Update' : 'Add'}</Label>
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
