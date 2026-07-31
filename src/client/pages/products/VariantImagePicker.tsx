import { Alert, Avatar, Button, Group, Stack, Text } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import React, { useCallback, useState } from 'react';

import { ErrorAlertIcon, ImageAcceptIcon, ImageDropzoneIdleIcon, ImageRejectIcon, RemoveImageIcon } from '@icons';

import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { useSetVariantImage } from '~/client/state/products/useSetVariantImage';
import { getErrorMessage } from '~/client/utils/errors';
import { readFileAsDataUrl } from '~/client/utils/readFileAsDataUrl';
import { IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE } from '~/common/utils/images';

interface VariantImagePickerProps {
    group: string;
    name: string;
    variant: string;
    image?: string;
}

export function VariantImagePicker({ group, name, variant, image }: VariantImagePickerProps): React.ReactElement {
    const _ = useLabels();
    const setVariantImage = useSetVariantImage();
    const [error, setError] = useState<string>();
    const [saving, setSaving] = useState(false);

    const handleDrop = useCallback(
        async (files: FileWithPath[]) => {
            if (files.length > 0) {
                setError(undefined);
                setSaving(true);
                try {
                    const dataUrl = await readFileAsDataUrl(files[0]!);
                    await setVariantImage(group, name, variant, dataUrl);
                } catch (e) {
                    setError(getErrorMessage(e));
                } finally {
                    setSaving(false);
                }
            }
        },
        [group, name, variant, setVariantImage]
    );

    const handleReject = useCallback(() => {
        setError(_('Choose a valid image file'));
    }, [_]);

    const handleRemove = useCallback(async () => {
        setError(undefined);
        setSaving(true);
        try {
            await setVariantImage(group, name, variant, '');
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setSaving(false);
        }
    }, [group, name, variant, setVariantImage]);

    return (
        <Stack gap={4}>
            <Dropzone
                onDrop={handleDrop}
                onReject={handleReject}
                maxSize={MAX_IMAGE_FILE_SIZE}
                accept={IMAGE_MIME_TYPES}
                multiple={false}
                disabled={saving}
            >
                <Group gap="sm" style={{ pointerEvents: 'none' }}>
                    {image ? (
                        // If the image fails to load, Mantine will render children as fallback.
                        <Avatar src={image} radius="md" size={40} aria-label={_('Variant image')}>
                            <ImageAcceptIcon size={20} stroke={1.5} />
                        </Avatar>
                    ) : (
                        <>
                            <Dropzone.Accept>
                                <ImageAcceptIcon size={20} stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <ImageRejectIcon size={20} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <ImageDropzoneIdleIcon size={20} stroke={1.5} />
                            </Dropzone.Idle>
                        </>
                    )}
                    <Text size="sm" c="dimmed">
                        <Label>Upload image</Label>
                    </Text>
                </Group>
            </Dropzone>
            {!!image && (
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<RemoveImageIcon size={14} />}
                    onClick={handleRemove}
                    disabled={saving}
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Label>Remove image</Label>
                </Button>
            )}
            {error && (
                <Alert variant="light" color="negative" icon={<ErrorAlertIcon size={16} />}>
                    {error}
                </Alert>
            )}
        </Stack>
    );
}
