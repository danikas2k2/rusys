import { Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import React from 'react';

import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { Label } from '~/client/common/Label';

interface DiscardChangesDialogProps {
    opened: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function DiscardChangesDialog({ opened, onConfirm, onClose }: DiscardChangesDialogProps) {
    return (
        <ConfirmationDialog
            opened={opened}
            onClose={onClose}
            onConfirm={onConfirm}
            title={<Label>Discard unsaved changes?</Label>}
            confirmButton={
                <Button variant="filled" color="negative" leftSection={<IconX size={18} />}>
                    <Label>Discard</Label>
                </Button>
            }
        />
    );
}
