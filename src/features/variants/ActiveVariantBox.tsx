import { Button } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { ConfirmationDialogIcon, DeleteIcon } from '@icons';

import type { Variant } from '~/common/data';
import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';
import { DialogIcon } from '~/components/common/DialogIcon';
import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { useDeleteVariant } from '~/features/variants/hooks/useDeleteVariant';
import { VariantBox } from '~/features/variants/VariantBox';

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
