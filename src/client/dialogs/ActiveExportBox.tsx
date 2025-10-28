import React, { useCallback } from 'react';

import { Button } from '@mantine/core';
import { IconCloudDownload } from '@tabler/icons-react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { Label } from '~/client/common/Label';
import { useExportHandler } from '~/client/hooks/useExportHandler';

export function ActiveExportBox() {
    const [active, setActive] = useActiveContent();

    const opened = active?.action === 'export';

    const handleClose = useCallback(() => setActive(), [setActive]);

    const handleExport = useExportHandler();
    const handleConfirm = useCallback(async () => {
        // ConfirmationDialog will handle loading state and call onClose after success
        await handleExport();
    }, [handleExport]);

    return (
        <ConfirmationDialog
            opened={opened}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title={<Label>Export data?</Label>}
            confirmButton={
                <Button variant="filled" color="blue" leftSection={<IconCloudDownload size={18} />}>
                    <Label>Export</Label>
                </Button>
            }
        >
            <Label>This will download all your data as a file.</Label>
        </ConfirmationDialog>
    );
}
