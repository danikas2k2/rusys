import React, { type PropsWithChildren, type ReactNode } from 'react';

import { IconButton } from '@ui/Button';
import { type ElementColor } from '@ui/Element';
import { MenuItem } from '@ui/MenuItem';

import cx from './ToolbarMenuItem.pcss';

export interface ToolbarMenuItemProps {
    onClick: () => void;
    icon?: ReactNode;
    color?: ElementColor;
    current?: boolean;
}

export function ToolbarMenuItem({ onClick, icon, color, current, children }: PropsWithChildren<ToolbarMenuItemProps>) {
    return (
        <MenuItem
            className={cx('ToolbarMenuItem', { current })}
            onClick={onClick}
            startDecorator={
                icon && (
                    <IconButton color={color} variant="plain">
                        {icon}
                    </IconButton>
                )
            }
        >
            {children}
        </MenuItem>
    );
}
