import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { Label } from '~/client/common/Label';

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
            title={<Label>Are you sure to remove?</Label>}
            confirmButton={
                <Button variant="filled" color="negative" leftSection={<IconTrash size={18} />}>
                    <Label>Remove</Label>
                </Button>
            }
        />
    );
}
