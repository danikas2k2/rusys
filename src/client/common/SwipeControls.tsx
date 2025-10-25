import React from 'react';

import { Button } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Label } from '~/client/common/Label';
import { SwipePanel } from '~/client/common/SwipePanel';

export interface SlideControlsProps<D = ActiveContentData> {
    onEdit?: (data: D, event: React.MouseEvent<HTMLButtonElement>) => void;
    onDelete?: (data: D, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SwipeControls<D = object>({ onEdit, onDelete }: SlideControlsProps<D>): React.JSX.Element {
    const [active, setActive] = useActiveContent<D>();

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (active) {
            // Pin the row to prevent it from closing during edit dialog
            setActive({ ...active, pinned: true, editing: true });
            const data = active.data;
            if (data) {
                onEdit?.(data, e);
            }
        }
    };

    const handleDeleteOpen = () => {
        if (active) {
            // Pin the row when confirmation dialog opens
            setActive({ ...active, pinned: true });
        }
    };

    const handleDeleteClose = () => {
        if (active) {
            // Unpin and close when dialog closes
            setActive(undefined);
        }
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        const data = active?.data;
        setActive(undefined);
        if (data) {
            onDelete?.(data, e);
        }
    };

    return (
        <SwipePanel>
            <Button variant="filled" color="blue" size="sm" leftSection={<IconEdit size={18} />} onClick={handleEdit}>
                <Label>Edit</Label>
            </Button>
            <ButtonWithConfirmation
                dialogHeader={<Label>Sure to remove?</Label>}
                onClick={handleDelete}
                onOpen={handleDeleteOpen}
                onClose={handleDeleteClose}
            >
                <Button variant="filled" color="red" size="sm" leftSection={<IconTrash size={18} />}>
                    <Label>Remove</Label>
                </Button>
            </ButtonWithConfirmation>
        </SwipePanel>
    );
}
