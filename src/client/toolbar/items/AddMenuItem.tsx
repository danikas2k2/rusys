import AddCircleIcon from '@icons/AddCircle.svg';
import React from 'react';
import { Label } from '~/client/common/Label';
import { ToolbarMenuItem } from '~/client/toolbar/ToolbarMenuItem';

interface AddMenuItemProps {
    onClick: () => void;
}

export function AddMenuItem({ onClick }: AddMenuItemProps) {
    return (
        <ToolbarMenuItem onClick={onClick} icon={<AddCircleIcon />} color="positive">
            <Label>Add</Label>
        </ToolbarMenuItem>
    );
}
