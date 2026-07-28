import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AddIcon, CancelIcon, MoveIcon, UpdateIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroups } from '~/client/state/groups/useGroups';
import { useAddProduct } from '~/client/state/products/useAddProduct';
import { useMoveProduct } from '~/client/state/products/useMoveProduct';
import { useProducts } from '~/client/state/products/useProducts';
import { useRenameProduct } from '~/client/state/products/useRenameProduct';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';

interface ProductBoxProps {
    opened?: boolean;
    group?: string;
    name?: string;
    onClose: (group?: string, name?: string) => void;
    onAfterClose?: () => void;
}

export function ProductBox({
    group: initialGroup = '',
    name: initialName = '',
    opened = false,
    onClose,
    onAfterClose,
}: Readonly<ProductBoxProps>) {
    const [filterGroup] = useGroupFilter();
    const isEditing = !!initialGroup && !!initialName;
    const isMoving = isEditing && filterGroup && filterGroup !== initialGroup;

    const _ = useLabels();
    const groups = useGroups()?.map((g) => g.group) ?? [];
    const products = useProducts();

    const form = useForm({
        initialValues: {
            group: initialGroup || filterGroup || '',
            name: initialName,
        },
        validate: {
            group: (value) => {
                if (!value?.trim()) {
                    return _('Category is required');
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
                const nameExists = products?.some(
                    (d) => !compareNames(d.group, values.group) && !compareNames(d.name, value)
                );
                const nameAdded = !initialName;
                const nameCopied = isEditing && values.group !== initialGroup;
                const nameRenamed = isEditing && value !== initialName && values.group === initialGroup;

                if (nameExists && (nameAdded || nameCopied || nameRenamed)) {
                    return _('Name already exists in this category');
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

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            formRef.current.setValues({
                group: initialGroup || filterGroup || '',
                name: initialName,
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
    }, [opened, initialGroup, initialName, filterGroup]);

    // Revalidate when group or name changes to show duplicate errors in real-time
    const groupValue = form.values.group;
    const nameValue = form.values.name;
    useEffect(() => {
        if (formRef.current.isTouched('name') || formRef.current.isTouched('group')) {
            formRef.current.validateField('name');
        }
    }, [groupValue, nameValue]);

    const addProduct = useAddProduct();
    const moveProduct = useMoveProduct();
    const renameProduct = useRenameProduct();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            if (validation.errors.group) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                groupRef.current?.focus();
            } else if (validation.errors.name) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
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
                await moveProduct(initialGroup, initialName, values.group, values.name);
            } else if (nameRenamed) {
                // Rename in same group
                await renameProduct(initialGroup, initialName, values.name);
            } else if (!isEditing) {
                // Add new
                await addProduct(values.group, values.name);
            }
            onClose(values.group, values.name);
        } catch (error) {
            form.setFieldError('name', getErrorMessage(error));
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            nameRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    // Determine button content
    const getButtonContent = () => {
        if (isMoving || (isEditing && form.values.group !== initialGroup)) {
            return {
                icon: <MoveIcon size={18} />,
                label: 'Move',
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
            opened={opened}
            title={_(isEditing ? 'Edit entry' : 'Add new entry')}
            withCloseButton
            isDirty={() => formRef.current.isDirty()}
            onClose={() => onClose()}
            closeOnEscape={!loading}
            closeOnClickOutside={!loading}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={onAfterClose}
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
