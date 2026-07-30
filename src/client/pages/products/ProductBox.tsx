import { Alert, Avatar, Button, Group, rem, Select, Stack, Text, TextInput, type ComboboxItem } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
    AddIcon,
    CancelIcon,
    ErrorAlertIcon,
    ImageAcceptIcon,
    ImageDropzoneIdleIcon,
    ImageRejectIcon,
    MoveIcon,
    ProductsNavIcon,
    RemoveImageIcon,
    UpdateIcon,
} from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { CategoryAvatar } from '~/client/filters/CategoryAvatar';
import { CategoryOption } from '~/client/filters/CategoryOption';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroups } from '~/client/state/groups/useGroups';
import { useAddProduct } from '~/client/state/products/useAddProduct';
import { useMoveProduct } from '~/client/state/products/useMoveProduct';
import { useProducts } from '~/client/state/products/useProducts';
import { useRenameProduct } from '~/client/state/products/useRenameProduct';
import { useSetProductImage } from '~/client/state/products/useSetProductImage';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';
import { readFileAsDataUrl } from '~/client/utils/readFileAsDataUrl';
import { IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE } from '~/common/utils/images';

interface ProductBoxProps {
    opened?: boolean;
    group?: string;
    name?: string;
    image?: string;
    onClose: (group?: string, name?: string) => void;
    onAfterClose?: () => void;
}

export function ProductBox({
    group: initialGroup = '',
    name: initialName = '',
    image: initialImage = '',
    opened = false,
    onClose,
    onAfterClose,
}: Readonly<ProductBoxProps>) {
    const [filterGroup] = useGroupFilter();
    const isEditing = !!initialGroup && !!initialName;
    const isMoving = isEditing && filterGroup && filterGroup !== initialGroup;

    const _ = useLabels();
    const allGroups = useGroups() ?? [];
    const groups = allGroups.map((g) => g.group);
    const imageByGroup = new Map(allGroups.map((g) => [g.group, g.image]));
    const products = useProducts();

    const form = useForm({
        initialValues: {
            group: initialGroup || filterGroup || '',
            name: initialName,
            image: initialImage,
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
    const [imageError, setImageError] = useState<string>();
    const groupRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            formRef.current.setValues({
                group: initialGroup || filterGroup || '',
                name: initialName,
                image: initialImage,
            });
            formRef.current.resetTouched();
            formRef.current.resetDirty();
            // eslint-disable-next-line react-hooks/set-state-in-effect -- loading reset when modal opens
            setLoading(false);

            setImageError(undefined);

            const timer = setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [opened, initialGroup, initialName, initialImage, filterGroup]);

    const handleImageDrop = useCallback(async (files: FileWithPath[]) => {
        if (files.length > 0) {
            setImageError(undefined);
            formRef.current.setFieldValue('image', await readFileAsDataUrl(files[0]!));
        }
    }, []);

    const handleImageReject = useCallback(() => {
        setImageError(_('Choose a valid image file'));
    }, [_]);

    const handleImageRemove = useCallback(() => {
        setImageError(undefined);
        formRef.current.setFieldValue('image', '');
    }, []);

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
    const setProductImage = useSetProductImage();

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
            const imageChanged = values.image !== initialImage;

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
            if (imageChanged) {
                await setProductImage(values.group, values.name, values.image);
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
            title={
                <DialogIcon aria-label={_(isEditing ? 'Edit entry' : 'Add new entry')}>
                    <ProductsNavIcon />
                </DialogIcon>
            }
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
                            renderOption={({ option }: { option: ComboboxItem }) => (
                                <CategoryOption option={option} image={imageByGroup.get(option.value)} />
                            )}
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
                        />
                        <TextInput
                            ref={nameRef}
                            label={_('Title')}
                            placeholder={_('Enter name')}
                            withAsterisk
                            disabled={loading}
                            {...form.getInputProps('name')}
                        />
                        <Dropzone
                            onDrop={handleImageDrop}
                            onReject={handleImageReject}
                            maxSize={MAX_IMAGE_FILE_SIZE}
                            accept={IMAGE_MIME_TYPES}
                            multiple={false}
                            disabled={loading}
                        >
                            <Group justify="center" gap="md" style={{ minHeight: rem(80), pointerEvents: 'none' }}>
                                {form.values.image ? (
                                    <Avatar
                                        src={form.values.image}
                                        radius="md"
                                        size={48}
                                        aria-label={_('Product image')}
                                    />
                                ) : (
                                    <>
                                        <Dropzone.Accept>
                                            <ImageAcceptIcon size={32} stroke={1.5} />
                                        </Dropzone.Accept>
                                        <Dropzone.Reject>
                                            <ImageRejectIcon size={32} stroke={1.5} />
                                        </Dropzone.Reject>
                                        <Dropzone.Idle>
                                            <ImageDropzoneIdleIcon size={32} stroke={1.5} />
                                        </Dropzone.Idle>
                                    </>
                                )}
                                <Text size="sm" c="dimmed" inline>
                                    <Label>Upload image</Label>
                                </Text>
                            </Group>
                        </Dropzone>
                        {!!form.values.image && (
                            <Button
                                variant="subtle"
                                color="gray"
                                size="xs"
                                leftSection={<RemoveImageIcon size={16} />}
                                onClick={handleImageRemove}
                                disabled={loading}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                <Label>Remove image</Label>
                            </Button>
                        )}
                        {imageError && (
                            <Alert variant="light" color="negative" icon={<ErrorAlertIcon size={18} />}>
                                {imageError}
                            </Alert>
                        )}
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
