import React, { useEffect, useRef } from 'react';

import { Button, Checkbox, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCalendarClock, IconCheck, IconPlus, IconX } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';
import { useTranslations } from '~/client/hooks/useTranslations';
import { useGroups } from '~/client/state/groups/useGroups';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';

interface GroupBoxProps {
    group?: string;
    annual?: boolean;
    onClose?: (group?: string) => void;
}

export function GroupBox({ group: initialGroup = '', annual: initialAnnual = true, onClose }: GroupBoxProps) {
    const _ = useTranslations();
    const groups = useGroups();
    const updateGroup = useUpdateGroup();
    const renameGroup = useRenameGroup();
    const inputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!initialGroup;

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

    // Focus input after modal opens
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Revalidate when group name changes to show duplicate errors in real-time
    useEffect(() => {
        if (form.isTouched('group')) {
            form.validateField('group');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.group]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            inputRef.current?.focus();
            return;
        }

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
        }
    };

    const handleClose = () => onClose?.();

    return (
        <Modal opened onClose={handleClose} title={_(isEditing ? 'Edit group' : 'Add new group')} centered>
            <form onSubmit={handleSubmit}>
                <Stack>
                    <TextInput
                        ref={inputRef}
                        label={_('Group name')}
                        placeholder={_('Enter group name')}
                        withAsterisk
                        {...form.getInputProps('group')}
                    />
                    <Checkbox
                        label={
                            <Group gap="xs">
                                <IconCalendarClock size={18} />
                                <Label>Annual</Label>
                            </Group>
                        }
                        {...form.getInputProps('annual', { type: 'checkbox' })}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" leftSection={<IconX size={18} />} onClick={handleClose}>
                            <Label>Cancel</Label>
                        </Button>
                        <Button
                            type="submit"
                            leftSection={isEditing ? <IconCheck size={18} /> : <IconPlus size={18} />}
                            loading={form.submitting}
                        >
                            <Label>{isEditing ? 'Update' : 'Add'}</Label>
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
