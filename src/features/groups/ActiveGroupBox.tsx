import { Button } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { ConfirmationDialogIcon, DeleteIcon } from '@icons';

import type { Group } from '~/common/data';
import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';
import { DialogIcon } from '~/components/common/DialogIcon';
import { Label } from '~/components/common/Label';
import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { GroupBox } from '~/features/groups/GroupBox';
import { useDeleteGroup } from '~/store/groups/useDeleteGroup';

export function ActiveGroupBox() {
    const [active, setActive] = useActiveContent<Group>();
    const [removing, setRemoving] = useState(false);
    const deleteGroup = useDeleteGroup();
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
        await deleteGroup(activeData.group);
        setRemoving(false);
        handleClose();
    }, [activeData, deleteGroup, handleClose]);

    return (
        <>
            <GroupBox
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
