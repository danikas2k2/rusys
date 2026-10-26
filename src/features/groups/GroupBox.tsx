import { ActionIcon, Button, Checkbox, Group, Stack, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AddIcon, AnnualIcon, CancelIcon, CategoriesNavIcon, DeleteIcon, ReviewIcon, UpdateIcon } from '@icons';

import { ConfirmableModal } from '~/components/common/ConfirmableModal';
import { DialogIcon } from '~/components/common/DialogIcon';
import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { Label } from '~/components/common/Label';
import { useDialogTracking, useFormTracking } from '~/components/common/useUsageTracking';
import { ImageDropzone } from '~/components/images/ImageDropzone';
import { useRenameGroup } from '~/features/groups/hooks/useRenameGroup';
import { useUpdateGroup } from '~/features/groups/hooks/useUpdateGroup';
import { useLabels } from '~/lib/hooks/useLabels';
import { trackFaroEvent } from '~/lib/observability/faro';
import { getErrorMessage } from '~/lib/utils/errors';
import { equals } from '~/lib/utils/names';
import { SchemaError, updateGroupSchema, type GroupIdentity } from '~/schema';
import { useGroups } from '~/store/groups';

interface GroupBoxProps {
    opened?: boolean;
    group?: string;
    annual?: boolean;
    review?: boolean;
    image?: string;
    onClose: (group?: string) => void;
    onAfterClose?: () => void;
    onDelete?: () => void;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
}

export function GroupBox({
    group: initialGroup = '',
    annual: initialAnnual = true,
    review: initialReview = false,
    image: initialImage = '',
    opened,
    onClose,
    onAfterClose,
    onDelete,
    closeOnEscape = true,
    closeOnClickOutside = true,
}: GroupBoxProps) {
    const isEditing = !!initialGroup;

    useDialogTracking('group', !!opened);
    const _ = useLabels();
    const groups = useGroups();

    const form = useForm({
        initialValues: {
            group: initialGroup,
            annual: initialAnnual,
            review: initialReview,
            image: initialImage,
        },
        validate: schemaResolver(
            updateGroupSchema.refine(
                ({ group }: GroupIdentity) => group === initialGroup || groups.every((g) => !equals(group, g.group)),
                { path: ['group'], error: SchemaError.CategoryAlreadyExists }
            ),
            { sync: true }
        ),
    });

    const usage = useFormTracking('group', !!opened);
    const formRef = useRef(form);
    useLayoutEffect(() => {
        formRef.current = form;
    });

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageProgress, setImageProgress] = useState<number>();
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset the form when the modal opens; Mantine focuses the marked name input.
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
            // eslint-disable-next-line react-hooks/set-state-in-effect -- submission state reset when modal opens
            setSubmitting(false);
            setLoading(false);
            setImageProgress(undefined);
        }
    }, [opened, initialGroup, initialAnnual, initialReview, initialImage]);

    const handleImageDrop = useCallback((dataUrl: string) => {
        trackFaroEvent('form_field_changed', { form: 'group', field: 'image' });
        formRef.current.setFieldValue('image', dataUrl);
    }, []);

    const handleImageRemove = useCallback(() => {
        trackFaroEvent('form_field_changed', { form: 'group', field: 'image' });
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
        trackFaroEvent('form_submitted', { form: 'group' });

        const validation = form.validate();
        if (validation.hasErrors) {
            for (const field of ['group', 'annual', 'review', 'image'] as const) {
                if (validation.errors[field]) {
                    trackFaroEvent('form_validation_failed', { form: 'group', field });
                }
            }
            // Focus first invalid field
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            inputRef.current?.focus();
            return;
        }

        setSubmitting(true);
        // Delay the loader to avoid flashing it for fast operations. The submit button is
        // disabled immediately via `submitting`, so the request cannot be started twice.
        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            const values = { ...form.values, ...updateGroupSchema.parse(form.values) };
            const groupRenamed = isEditing && values.group !== initialGroup;
            const annualChanged = values.annual !== initialAnnual;
            const reviewChanged = values.review !== initialReview;
            const imageChanged = values.image !== initialImage;
            const uploadingImage = imageChanged && values.image.startsWith('data:');
            if (uploadingImage) {
                setImageProgress(0);
            }

            if (groupRenamed) {
                if (uploadingImage) {
                    await renameGroup(
                        {
                            group: initialGroup,
                            targetGroup: values.group,
                            annual: values.annual,
                            review: values.review,
                            image: values.image,
                        },
                        setImageProgress
                    );
                } else {
                    await renameGroup({
                        group: initialGroup,
                        targetGroup: values.group,
                        annual: values.annual,
                        review: values.review,
                        image: values.image,
                    });
                }
            } else if (!isEditing || annualChanged || reviewChanged || imageChanged) {
                if (uploadingImage) {
                    await updateGroup(values, setImageProgress);
                } else {
                    await updateGroup(values);
                }
            }
            trackFaroEvent('form_result', { form: 'group', result: 'success' });
            onClose(values.group);
        } catch (error) {
            trackFaroEvent('form_result', { form: 'group', result: 'error' });
            form.setFieldError('group', getErrorMessage(error));
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            inputRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setSubmitting(false);
            setLoading(false);
            setImageProgress(undefined);
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
            closeOnEscape={!loading && closeOnEscape}
            closeOnClickOutside={!loading && closeOnClickOutside}
            closeButtonProps={{ 'aria-label': _('Close') }}
        >
            {(handleClose) => (
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            ref={inputRef}
                            data-autofocus
                            label={_('Category name')}
                            placeholder={_('Enter category name')}
                            withAsterisk
                            disabled={loading}
                            {...form.getInputProps('group')}
                            onBlur={() => {
                                form.getInputProps('group').onBlur();
                                usage.field('group', form.isDirty('group'));
                            }}
                            error={typeof form.errors.group === 'string' ? _(form.errors.group) : form.errors.group}
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
                            onBlur={() => {
                                form.getInputProps('annual').onBlur();
                                usage.field('annual', form.isDirty('annual'));
                            }}
                            onChange={(event) => {
                                form.getInputProps('annual', { type: 'checkbox' }).onChange(event);
                                trackFaroEvent('checkbox_changed', {
                                    control: 'category_annual',
                                    state: event.currentTarget.checked ? 'checked' : 'unchecked',
                                });
                            }}
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
                            onBlur={() => {
                                form.getInputProps('review').onBlur();
                                usage.field('review', form.isDirty('review'));
                            }}
                            onChange={(event) => {
                                form.getInputProps('review', { type: 'checkbox' }).onChange(event);
                                trackFaroEvent('checkbox_changed', {
                                    control: 'category_review',
                                    state: event.currentTarget.checked ? 'checked' : 'unchecked',
                                });
                            }}
                        />
                        <ImageDropzone
                            image={form.values.image}
                            label={_('Category image')}
                            onDrop={handleImageDrop}
                            onRemove={handleImageRemove}
                            disabled={loading}
                            progress={imageProgress}
                        />
                        <Group justify={isEditing && onDelete ? 'space-between' : 'flex-end'} mt="md" wrap="nowrap">
                            {isEditing && onDelete && (
                                <IconButtonTooltip>
                                    <ActionIcon
                                        variant="outline"
                                        color="negative"
                                        size="lg"
                                        disabled={loading}
                                        onClick={onDelete}
                                        aria-label={_('Remove')}
                                    >
                                        <DeleteIcon size={18} />
                                    </ActionIcon>
                                </IconButtonTooltip>
                            )}
                            <Group gap="sm" wrap="nowrap">
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
                                    disabled={submitting}
                                    loading={loading}
                                    leftSection={isEditing ? <UpdateIcon size={18} /> : <AddIcon size={18} />}
                                    {...(!isEditing ? { color: 'positive', 'data-color': 'positive' } : {})}
                                >
                                    <Label>{isEditing ? 'Update' : 'Add'}</Label>
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </form>
            )}
        </ConfirmableModal>
    );
}
