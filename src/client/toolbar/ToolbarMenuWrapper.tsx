import MenuIcon from '@icons/Menu.svg';
import { IconButton } from '@ui/Button';
import { ColorSchemeToggle } from '@ui/ColorSchemeToggle';
import type { DropdownRef } from '@ui/Dropdown';
import { Menu } from '@ui/Menu';
import { MenuDivider } from '@ui/MenuDivider';
import { MenuItem } from '@ui/MenuItem';
import React, { forwardRef, type PropsWithChildren, type Ref } from 'react';
import { useLabel } from '~/client/hooks/useLabel';

export const ToolbarMenuWrapper = forwardRef(function ToolbarMenuWrapper(
    { children }: PropsWithChildren,
    ref: Ref<DropdownRef>
) {
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
});
