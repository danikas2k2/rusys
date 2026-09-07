import { Alert, Button, Group, rem, Text } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { MAX_IMPORT_FILE_MB, MAX_IMPORT_FILE_SIZE } from '@rusys/common/utils/files';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    CancelIcon,
    ErrorAlertIcon,
    ImportAcceptIcon,
    ImportDropzoneIdleIcon,
    ImportIcon,
    ImportRejectIcon,
} from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { useImportHandler } from '~/client/hooks/useImportHandler';
import { useLabel } from '~/client/hooks/useLabel';

interface ImportBoxProps {
    opened?: boolean;
    onClose: () => void;
}

export function ImportBox({ opened = false, onClose }: ImportBoxProps) {
    const [error, setError] = useState<string>();
    const [file, setFile] = useState<FileWithPath | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const handleImport = useImportHandler();

    const handleDrop = useCallback((files: FileWithPath[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError(undefined);
        }
    }, []);

    const handleReject = useCallback(() => {
        setError('Choose a valid ZIP file');
    }, []);

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        setError(undefined);

        const formData = new FormData();
        formData.append('import', file);

        try {
            await handleImport(formData);
            setFile(null);
            onClose();
            // Reload current page after successful import
            navigate(0);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Failed to import file');
        } finally {
            setLoading(false);
        }
    }, [file, handleImport, onClose, navigate]);

    // Clear state when dialog closes
    useEffect(() => {
        if (!opened) {
            // Intentionally clearing state when dialog closes for proper cleanup
            // oxlint-disable-next-line react/set-state-in-effect
            setError(undefined);
            setFile(null);
            setLoading(false);
        }
    }, [opened]);

    return (
        <ConfirmableModal
            opened={opened}
            isDirty={() => !!file}
            onClose={onClose}
            title={
                <DialogIcon aria-label={useLabel('Import')}>
                    <ImportIcon />
                </DialogIcon>
            }
            closeButtonProps={{ 'aria-label': useLabel('Close') }}
            size="lg"
            centered
        >
            {(handleClose) => (
                <>
                    <Dropzone
                        onDrop={handleDrop}
                        onReject={handleReject}
                        maxSize={MAX_IMPORT_FILE_SIZE}
                        accept={{ 'application/zip': ['.zip'] }}
                        multiple={false}
                        disabled={loading}
                    >
                        <Group justify="center" gap="xl" style={{ minHeight: rem(120), pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <ImportAcceptIcon size={52} stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <ImportRejectIcon size={52} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <ImportDropzoneIdleIcon size={52} stroke={1.5} />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    {file ? file.name : <Label>Drag ZIP file here or click to select</Label>}
                                </Text>
                                {(!file || file.length > MAX_IMPORT_FILE_SIZE) && (
                                    <Text size="sm" c="dimmed" inline mt="xs">
                                        <Label>File should not exceed</Label>
                                        {` ${MAX_IMPORT_FILE_MB}MB`}
                                    </Text>
                                )}
                            </div>
                        </Group>
                    </Dropzone>

                    {error && (
                        <Alert variant="light" color="negative" icon={<ErrorAlertIcon size={18} />} mt="md">
                            {error}
                        </Alert>
                    )}

                    <Group justify="center" mt="md">
                        <Button
                            variant="outline"
                            color="gray"
                            leftSection={<CancelIcon size={18} />}
                            onClick={handleClose}
                            disabled={loading}
                        >
                            <Label>Cancel</Label>
                        </Button>
                        <Button
                            variant="filled"
                            color="primary"
                            leftSection={<ImportIcon size={18} />}
                            loading={loading}
                            onClick={handleSubmit}
                            disabled={!file}
                        >
                            <Label>Import</Label>
                        </Button>
                    </Group>
                </>
            )}
        </ConfirmableModal>
    );
}
