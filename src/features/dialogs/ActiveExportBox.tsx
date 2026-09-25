import { Button } from '@mantine/core';
import React, { useCallback } from 'react';

import { ExportIcon } from '@icons';

import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';
import { DialogIcon } from '~/components/common/DialogIcon';
import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { useExportHandler } from '~/lib/hooks/useExportHandler';

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
            title={
                <>
                    <DialogIcon>
                        <ExportIcon />
                    </DialogIcon>
                    <Label>Export data?</Label>
                </>
            }
            confirmButton={
                <Button variant="filled" color="primary" leftSection={<ExportIcon size={18} />}>
                    <Label>Export</Label>
                </Button>
            }
        >
            <Label>This will download all your data as a file.</Label>
        </ConfirmationDialog>
    );
}
