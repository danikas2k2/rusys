import AddCircleIcon from '@assets/add-circle.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { ToolbarMenuItem } from '~/client/app/toolbar/ToolbarMenuItem';

interface AddMenuItemProps {
    onClick: () => void;
}

export function AddMenuItem({ onClick }: AddMenuItemProps) {
    return (
        <ToolbarMenuItem onClick={onClick} icon={<AddCircleIcon />} color="green">
            <Label>Add</Label>
        </ToolbarMenuItem>
    );
}
