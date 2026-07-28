import { Button } from '@mantine/core';
import React, { useCallback } from 'react';

import { DeleteIcon, EditIcon } from '@icons';

import { useActiveContent, type ActiveContentData } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { SwipePanel } from '~/client/common/SwipePanel';

export interface SlideControlsProps<D = ActiveContentData> {
    withEdit?: boolean;
    onEdit?: (data: D, event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    withDelete?: boolean;
    onDelete?: (data: D, event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export function SwipeControls<D = object>({
    withEdit = true,
    onEdit,
    withDelete = true,
    onDelete,
}: SlideControlsProps<D>): React.ReactElement {
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
            {withEdit && (
                <Button
                    variant="filled"
                    color="primary"
                    size="sm"
                    leftSection={<EditIcon size={18} />}
                    onClick={handleEdit}
                >
                    <Label>Edit</Label>
                </Button>
            )}
            {withDelete && (
                <Button
                    variant="filled"
                    color="negative"
                    size="sm"
                    leftSection={<DeleteIcon size={18} />}
                    onClick={handleDelete}
                >
                    <Label>Remove</Label>
                </Button>
            )}
        </SwipePanel>
    );
}
