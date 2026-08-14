import { Button } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { ConfirmationDialogIcon, DeleteIcon } from '@icons';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';
import type { Group } from '~/types/data';

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
