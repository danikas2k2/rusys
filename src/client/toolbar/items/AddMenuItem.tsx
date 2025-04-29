import React from 'react';
import AddCircleIcon from '@assets/add-circle.svg';
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
