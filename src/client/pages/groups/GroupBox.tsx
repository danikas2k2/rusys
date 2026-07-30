import { Alert, Avatar, Button, Checkbox, Group, rem, Stack, Text, TextInput } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
    AddIcon,
    AnnualIcon,
    CancelIcon,
    CategoriesNavIcon,
    ErrorAlertIcon,
    ImageAcceptIcon,
    ImageDropzoneIdleIcon,
    ImageRejectIcon,
    RemoveImageIcon,
    ReviewIcon,
    UpdateIcon,
} from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroups } from '~/client/state/groups/useGroups';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';
import { readFileAsDataUrl } from '~/client/utils/readFileAsDataUrl';
import { IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE } from '~/common/utils/images';

interface GroupBoxProps {
    opened?: boolean;
    group?: string;
    annual?: boolean;
    review?: boolean;
    image?: string;
    onClose: (group?: string) => void;
    onAfterClose?: () => void;
}

export function GroupBox({
    group: initialGroup = '',
    annual: initialAnnual = true,
    review: initialReview = false,
    image: initialImage = '',
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
            review: initialReview,
            image: initialImage,
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
                    return _('Category already exists');
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
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            formRef.current.setValues({
                group: initialGroup,
                annual: initialAnnual,
                review: initialReview,
                image: initialImage,
            });
            formRef.current.resetTouched();
            formRef.current.resetDirty();
            // eslint-disable-next-line react-hooks/set-state-in-effect -- loading reset when modal opens
            setLoading(false);

            setImageError(undefined);

            const timer = setTimeout(() => {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [opened, initialGroup, initialAnnual, initialReview, initialImage]);

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

    // Revalidate when group name changes to show duplicate errors in real-time
    const groupValue = form.values.group;
    useEffect(() => {
        if (formRef.current.isTouched('group')) {
            formRef.current.validateField('group');
        }
    }, [groupValue]);

    const updateGroup = useUpdateGroup();
    const renameGroup = useRenameGroup();
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            // istanbul ignore next - ref.current is always assigned in React Testing Library
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
            const reviewChanged = values.review !== initialReview;
            const imageChanged = values.image !== initialImage;

            if (groupRenamed) {
                await renameGroup(initialGroup, values.group, values.annual, values.review, values.image);
            } else if (!isEditing || annualChanged || reviewChanged || imageChanged) {
                await updateGroup(values.group, values.annual, values.review, values.image);
            }
            onClose(values.group);
        } catch (error) {
            form.setFieldError('group', getErrorMessage(error));
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            inputRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    return (
        <ConfirmableModal
            centered
            opened={!!opened}
            title={
                <DialogIcon aria-label={_(isEditing ? 'Edit category' : 'Add new category')}>
                    <CategoriesNavIcon />
                </DialogIcon>
            }
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
                        <TextInput
                            ref={inputRef}
                            label={_('Category name')}
                            placeholder={_('Enter category name')}
                            withAsterisk
                            disabled={loading}
                            {...form.getInputProps('group')}
                        />
                        <Checkbox
                            variant="outline"
                            label={
                                <Group gap="xs">
                                    <AnnualIcon size={18} />
                                    <Label>Annual</Label>
                                </Group>
                            }
                            disabled={loading}
                            {...form.getInputProps('annual', { type: 'checkbox' })}
                        />
                        <Checkbox
                            variant="outline"
                            label={
                                <Group gap="xs">
                                    <ReviewIcon size={18} />
                                    <Label>Review</Label>
                                </Group>
                            }
                            disabled={loading}
                            {...form.getInputProps('review', { type: 'checkbox' })}
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
                                        aria-label={_('Category image')}
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
                                leftSection={isEditing ? <UpdateIcon size={18} /> : <AddIcon size={18} />}
                                color={!isEditing ? 'positive' : undefined}
                            >
                                <Label>{isEditing ? 'Update' : 'Add'}</Label>
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </ConfirmableModal>
    );
}
