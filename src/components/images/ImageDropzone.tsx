import { ActionIcon, Alert, Box, Group, rem, Stack, Text } from '@mantine/core';
import { Dropzone, type FileRejection, type FileWithPath } from '@mantine/dropzone';
import React, { useCallback, useState } from 'react';

import { ErrorAlertIcon, ImageAcceptIcon, ImageDropzoneIdleIcon, ImageRejectIcon, RemoveImageIcon } from '@icons';

import { IMAGE_MIME_TYPES, MAX_IMAGE_FILE_MB, MAX_IMAGE_FILE_SIZE } from '~/common/utils/files';
import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { Label } from '~/components/common/Label';
import { Thumbnail } from '~/components/common/Thumbnail';
import { useLabels } from '~/lib/hooks/useLabels';
import { getErrorMessage } from '~/lib/utils/errors';
import { readFileAsDataUrl } from '~/lib/utils/readFileAsDataUrl';

interface ImageDropzoneProps {
    image?: string;
    label: string;
    onDrop: (dataUrl: string) => void | Promise<void>;
    onRemove: () => void | Promise<void>;
    disabled?: boolean;
    compact?: boolean;
    error?: React.ReactNode;
}

export function ImageDropzone({
    image,
    label,
    onDrop,
    onRemove,
    disabled,
    compact,
    error: externalError,
}: ImageDropzoneProps) {
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
        <Stack gap={compact ? 4 : undefined} data-testid="image-dropzone">
            <Box pos="relative">
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
                            <Thumbnail
                                src={image}
                                alt={label}
                                fallback={<ImageAcceptIcon size={previewIconSize} stroke={1.5} />}
                                radius="md"
                                size={avatarSize}
                                aria-label={label}
                            />
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
                    <IconButtonTooltip>
                        <ActionIcon
                            variant="outline"
                            color="negative"
                            size={compact ? 'sm' : 'md'}
                            onClick={handleRemove}
                            disabled={disabled || saving}
                            aria-label={_('Remove image')}
                            style={{
                                position: 'absolute',
                                insetInlineEnd: rem(compact ? 6 : 8),
                                bottom: rem(compact ? 6 : 8),
                            }}
                        >
                            <RemoveImageIcon size={removeIconSize} />
                        </ActionIcon>
                    </IconButtonTooltip>
                )}
            </Box>
            {(error || externalError) && (
                <Alert variant="light" color="negative" icon={<ErrorAlertIcon size={errorIconSize} />}>
                    {error || externalError}
                </Alert>
            )}
        </Stack>
    );
}
