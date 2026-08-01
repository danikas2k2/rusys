import { Alert, Avatar, Button, Group, rem, Stack, Text } from '@mantine/core';
import { Dropzone, type FileRejection, type FileWithPath } from '@mantine/dropzone';
import React, { useCallback, useState } from 'react';

import { ErrorAlertIcon, ImageAcceptIcon, ImageDropzoneIdleIcon, ImageRejectIcon, RemoveImageIcon } from '@icons';

import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { getErrorMessage } from '~/client/utils/errors';
import { readFileAsDataUrl } from '~/client/utils/readFileAsDataUrl';
import { IMAGE_MIME_TYPES, MAX_IMAGE_FILE_MB, MAX_IMAGE_FILE_SIZE } from '~/common/utils/files';

interface ImageDropzoneProps {
    image?: string;
    label: string;
    onDrop: (dataUrl: string) => void | Promise<void>;
    onRemove: () => void | Promise<void>;
    disabled?: boolean;
    compact?: boolean;
}

export function ImageDropzone({ image, label, onDrop, onRemove, disabled, compact }: ImageDropzoneProps) {
    const _ = useLabels();
    const [error, setError] = useState<string>();
    const [saving, setSaving] = useState(false);

    const handleDrop = useCallback(
        async (files: FileWithPath[]) => {
            if (files.length > 0) {
                setError(undefined);
                setSaving(true);
                try {
                    await onDrop(await readFileAsDataUrl(files[0]!));
                } catch (e) {
                    setError(getErrorMessage(e));
                } finally {
                    setSaving(false);
                }
            }
        },
        [onDrop]
    );

    const handleReject = useCallback(
        (fileRejections: FileRejection[]) => {
            const tooLarge = fileRejections.some((rejection) =>
                rejection.errors.some((fileError: { code: string }) => fileError.code === 'file-too-large')
            );
            setError(
                tooLarge ? `${_('File should not exceed')} ${MAX_IMAGE_FILE_MB}MB` : _('Choose a valid image file')
            );
        },
        [_]
    );

    const handleRemove = useCallback(async () => {
        setError(undefined);
        setSaving(true);
        try {
            await onRemove();
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setSaving(false);
        }
    }, [onRemove]);

    const avatarSize = compact ? 40 : 48;
    const previewIconSize = compact ? 20 : 24;
    const idleIconSize = compact ? 20 : 32;
    const removeIconSize = compact ? 14 : 16;
    const errorIconSize = compact ? 16 : 18;

    return (
        <Stack gap={compact ? 4 : undefined}>
            <Dropzone
                onDrop={handleDrop}
                onReject={handleReject}
                maxSize={MAX_IMAGE_FILE_SIZE}
                accept={IMAGE_MIME_TYPES}
                multiple={false}
                disabled={disabled || saving}
            >
                <Group
                    justify={compact ? undefined : 'center'}
                    gap={compact ? 'sm' : 'md'}
                    style={{ minHeight: compact ? undefined : rem(80), pointerEvents: 'none' }}
                >
                    {image ? (
                        // If the image fails to load, Mantine will render children as fallback.
                        <Avatar src={image} radius="md" size={avatarSize} aria-label={label}>
                            <ImageAcceptIcon size={previewIconSize} stroke={1.5} />
                        </Avatar>
                    ) : (
                        <>
                            <Dropzone.Accept>
                                <ImageAcceptIcon size={idleIconSize} stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <ImageRejectIcon size={idleIconSize} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <ImageDropzoneIdleIcon size={idleIconSize} stroke={1.5} />
                            </Dropzone.Idle>
                        </>
                    )}
                    <div>
                        <Text size="sm" c="dimmed" inline={!compact}>
                            <Label>Upload image</Label>
                        </Text>
                        {!image && (
                            <Text size="xs" c="dimmed" inline={!compact}>
                                {_('File should not exceed')} {MAX_IMAGE_FILE_MB}MB
                            </Text>
                        )}
                    </div>
                </Group>
            </Dropzone>
            {!!image && (
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<RemoveImageIcon size={removeIconSize} />}
                    onClick={handleRemove}
                    disabled={disabled || saving}
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Label>Remove image</Label>
                </Button>
            )}
            {error && (
                <Alert variant="light" color="negative" icon={<ErrorAlertIcon size={errorIconSize} />}>
                    {error}
                </Alert>
            )}
        </Stack>
    );
}
