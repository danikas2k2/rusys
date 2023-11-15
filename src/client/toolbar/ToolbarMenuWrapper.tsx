import MenuIcon from '@icons/Menu.svg';
import ColorSchemeToggler from '@ui/ColorSchemeToggler';
import IconButton from '@ui/IconButton';
import Menu from '@ui/Menu';
import MenuDivider from '@ui/MenuDivider';
import MenuItem from '@ui/MenuItem';
import { isEqual } from 'lodash';
import React, { memo, type PropsWithChildren } from 'react';
import { useLabel } from '~/client/hooks/useLabel';

export default memo(function ToolbarMenuWrapper({ children }: PropsWithChildren) {
    return (
        <Menu
            trigger={
                <IconButton variant="plain" color="neutral">
                    <MenuIcon aria-label={useLabel('Menu')} />
                </IconButton>
            }
        >
            {children}
            <MenuDivider />
            <MenuItem>
                <ColorSchemeToggler />
            </MenuItem>
        </Menu>
    );
}, isEqual);
