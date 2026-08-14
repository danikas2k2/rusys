import { Button } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { ConfirmationDialogIcon, DeleteIcon } from '@icons';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import type { Variant } from '~/types/data';

export function ActiveVariantBox() {
    const [active, setActive] = useActiveContent<Variant>();
    const [removing, setRemoving] = useState(false);
    const deleteVariant = useDeleteVariant();
    const activeData = active?.data;

    const opened = active?.action === 'update';

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const handleDelete = useCallback(() => setRemoving(true), []);
    const handleRemoveClose = useCallback(() => setRemoving(false), []);
    const handleRemoveConfirm = useCallback(async () => {
        if (!activeData) {
            return;
        }
        await deleteVariant(activeData.group, activeData.variant);
        setRemoving(false);
        handleClose();
    }, [activeData, deleteVariant, handleClose]);

    return (
        <>
            <VariantBox
                opened={opened}
                {...activeData}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                onDelete={handleDelete}
                closeOnEscape={!removing}
                closeOnClickOutside={!removing}
            />
            <ConfirmationDialog
                opened={removing}
                onClose={handleRemoveClose}
                onConfirm={handleRemoveConfirm}
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
        </>
    );
}
