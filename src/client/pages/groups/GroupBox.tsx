import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AddIcon, AnnualIcon, CancelIcon, CategoriesNavIcon, ReviewIcon, UpdateIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
import { ImageDropzone } from '~/client/common/ImageDropzone';
import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroups } from '~/client/state/groups/useGroups';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';
import type { ImageRef } from '~/types/data';

interface GroupBoxProps {
    opened?: boolean;
    group?: string;
    annual?: boolean;
    review?: boolean;
    image?: ImageRef;
    onClose: (group?: string) => void;
    onAfterClose?: () => void;
}

export function GroupBox({
    group: initialGroup = '',
    annual: initialAnnual = true,
    review: initialReview = false,
    image,
    opened,
    onClose,
    onAfterClose,
}: GroupBoxProps) {
    // The form only ever deals with a plain string - the url to preview, or a fresh data: URL
    // pending upload; server-side classification (photoUrl) happens only after saving.
    const initialImage = image?.url ?? '';
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

            const timer = setTimeout(() => {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [opened, initialGroup, initialAnnual, initialReview, initialImage]);

    const handleImageDrop = useCallback((dataUrl: string) => {
        formRef.current.setFieldValue('image', dataUrl);
    }, []);

    const handleImageRemove = useCallback(() => {
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
                        <ImageDropzone
                            image={form.values.image}
                            label={_('Category image')}
                            onDrop={handleImageDrop}
                            onRemove={handleImageRemove}
                            disabled={loading}
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
