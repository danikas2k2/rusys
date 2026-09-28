import { Button } from '@mantine/core';
import React from 'react';

import { ConfirmationDialogIcon, DiscardIcon } from '@icons';

import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';
import { DialogIcon } from '~/components/common/DialogIcon';
import { Label } from '~/components/common/Label';

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
            title={
                <>
                    <DialogIcon>
                        <ConfirmationDialogIcon />
                    </DialogIcon>
                    <Label>Discard unsaved changes?</Label>
                </>
            }
            confirmButton={
                <Button variant="filled" color="negative" leftSection={<DiscardIcon size={18} />}>
                    <Label>Discard</Label>
                </Button>
            }
        />
    );
}
