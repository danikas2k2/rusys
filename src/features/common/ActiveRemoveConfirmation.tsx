import { Button } from '@mantine/core';
import React, { useCallback } from 'react';

import { ConfirmationDialogIcon, DeleteIcon } from '@icons';

import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';
import { DialogIcon } from '~/components/common/DialogIcon';
import { Label } from '~/components/common/Label';
import { useActiveContent, type ActiveContentData } from '~/components/runtime/ActiveContentContext';

interface ActiveRemoveConfirmationProps<D = ActiveContentData> {
    onConfirm?: (data: D) => void | Promise<void>;
}

export function ActiveRemoveConfirmation<D = ActiveContentData>({
    onConfirm,
}: ActiveRemoveConfirmationProps<D>): React.ReactElement {
    const [active, setActive] = useActiveContent<D>();

    const opened = !!(active?.action === 'remove' && active?.data);

    const handleClose = useCallback(() => setActive(), [setActive]);

    const handleConfirm = useCallback(async () => {
        await onConfirm?.(active!.data!); // handleConfirm is only callable when active?.data is defined
        handleClose();
    }, [active, handleClose, onConfirm]);

    return (
        <ConfirmationDialog
            opened={opened}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title={
                <>
                    <DialogIcon>
                        <ConfirmationDialogIcon />
                    </DialogIcon>
                    <Label>Are you sure to remove?</Label>
                </>
            }
            confirmButton={
                <Button variant="filled" color="negative" leftSection={<DeleteIcon size={18} />}>
                    <Label>Remove</Label>
                </Button>
            }
        />
    );
}
