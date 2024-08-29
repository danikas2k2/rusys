import { IconButton } from '@ui/Button';
import type { InputColor } from '@ui/Input';
import { MenuItem } from '@ui/MenuItem';
import React, { type PropsWithChildren, type ReactNode } from 'react';
import cx from './ToolbarMenuItem.less';

export interface ToolbarMenuItemProps {
    onClick: () => void;
    icon: ReactNode;
    color?: InputColor;
    current?: boolean;
}

export function ToolbarMenuItem({ onClick, icon, color, current, children }: PropsWithChildren<ToolbarMenuItemProps>) {
    return (
        <MenuItem
            className={cx('ToolbarMenuItem', { current })}
            onClick={onClick}
            startDecorator={
                <IconButton variant="plain" color={color}>
                    {icon}
                </IconButton>
            }
        >
            {children}
        </MenuItem>
    );
}
