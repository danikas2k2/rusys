import React, { type PropsWithChildren, type RefAttributes } from 'react';
import MenuIcon from '@assets/menu.svg';
import { IconButton } from '@ui/Button';
import { ColorSchemeToggle } from '@ui/ColorSchemeToggle';
import { type DropdownRef } from '@ui/Dropdown';
import { Menu } from '@ui/Menu';
import { MenuDivider } from '@ui/MenuDivider';
import { MenuItem } from '@ui/MenuItem';
import { useLabel } from '~/client/hooks/useLabel';

export function ToolbarMenuWrapper({ ref, children }: PropsWithChildren<RefAttributes<DropdownRef>>) {
    const menuLabel = useLabel('Menu');
    return (
        <Menu
            ref={ref}
            role="menu"
            trigger={
                <IconButton variant="plain" color="neutral">
                    <MenuIcon aria-label={menuLabel} />
                </IconButton>
            }
        >
            {children}
            <MenuDivider />
            <MenuItem>
                <ColorSchemeToggle />
            </MenuItem>
        </Menu>
    );
}
