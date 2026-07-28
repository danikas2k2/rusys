import { Alert, Button, Group, rem, Text } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
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
import { Label } from '~/client/common/Label';
import { useImportHandler } from '~/client/hooks/useImportHandler';
import { useLabel } from '~/client/hooks/useLabel';

const MAX_FILE_SIZE = 10; // in MB

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
        setError('Choose a valid JSON file');
    }, []);

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        setError(undefined);

        const formData = new FormData();
        formData.append('import', file);

        const response = await handleImport(formData);

        setLoading(false);

        if (response.ok) {
            setFile(null);
            onClose();
            // Reload current page after successful import
            navigate(0);
        } else {
            setError(response.error ?? 'Failed to import file');
        }
    }, [file, handleImport, onClose, navigate]);

    // Clear state when dialog closes
    useEffect(() => {
        if (!opened) {
            // Intentionally clearing state when dialog closes for proper cleanup
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(undefined);
            setFile(null);
            setLoading(false);
        }
    }, [opened]);

    const maxSize = MAX_FILE_SIZE * 1024 ** 2;
    return (
        <ConfirmableModal
            opened={opened}
            isDirty={() => !!file}
            onClose={onClose}
            title={<Label>Import</Label>}
            closeButtonProps={{ 'aria-label': useLabel('Close') }}
            size="lg"
            centered
        >
            {(handleClose) => (
                <>
                    <Dropzone
                        onDrop={handleDrop}
                        onReject={handleReject}
                        maxSize={maxSize}
                        accept={{ 'application/json': ['.json'] }}
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
                                    {file ? file.name : <Label>Drag JSON file here or click to select</Label>}
                                </Text>
                                {(!file || file.length > maxSize) && (
                                    <Text size="sm" c="dimmed" inline mt="xs">
                                        <Label>File should not exceed</Label>
                                        {` ${MAX_FILE_SIZE}MB`}
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
