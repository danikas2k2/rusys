import React, { type PropsWithChildren, type ReactNode } from 'react';
import { IconButton } from '@ui/Button';
import { MenuItem } from '@ui/MenuItem';
import cx from './ToolbarMenuItem.pcss';

export interface ToolbarMenuItemProps {
    onClick: () => void;
    icon: ReactNode;
    current?: boolean;
}

export function ToolbarMenuItem({ onClick, icon, current, children }: PropsWithChildren<ToolbarMenuItemProps>) {
    return (
        <MenuItem
            className={cx('ToolbarMenuItem', { current })}
            onClick={onClick}
            startDecorator={<IconButton variant="plain">{icon}</IconButton>}
        >
            {children}
        </MenuItem>
    );
}
