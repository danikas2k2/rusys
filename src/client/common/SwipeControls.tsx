import { Button } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { SwipePanel } from '~/client/common/SwipePanel';

export interface SlideControlsProps<D = ActiveContentData> {
    onEdit?: (data: D, event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    onDelete?: (data: D, event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export function SwipeControls<D = object>({ onEdit, onDelete }: SlideControlsProps<D>): React.ReactElement {
    const [active, setActive] = useActiveContent<D>();

    const handleEdit = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            setActive({ ...active, action: 'update' });
            const data = active?.data;
            if (data) {
                await onEdit?.(data, e);
            }
        },
        [active, onEdit, setActive]
    );

    const handleDelete = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            setActive({ ...active, action: 'remove' });
            const data = active?.data;
            if (data) {
                await onDelete?.(data, e);
            }
        },
        [active, onDelete, setActive]
    );

    return (
        <SwipePanel>
            <Button
                variant="filled"
                color="primary"
                size="sm"
                leftSection={<IconEdit size={18} />}
                onClick={handleEdit}
            >
                <Label>Edit</Label>
            </Button>
            <Button
                variant="filled"
                color="negative"
                size="sm"
                leftSection={<IconTrash size={18} />}
                onClick={handleDelete}
            >
                <Label>Remove</Label>
            </Button>
        </SwipePanel>
    );
}
