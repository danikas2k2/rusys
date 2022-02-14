import { Category as CategoryIcon, Group as GroupIcon, Menu as MenuIcon } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import * as React from 'react';
import { useRef, useState } from 'react';
import { Label } from '~/Label';

export default function CellarMenu() {
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton
                ref={anchorRef}
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={() => setOpen(!open)}
                edge="start"
                disabled
            >
                <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorRef?.current} open={open} onClose={() => setOpen(!open)}>
                <MenuItem disabled>
                    <ListItemIcon>
                        <CategoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        <Label>Manage items</Label>
                    </ListItemText>
                </MenuItem>
                <MenuItem disabled>
                    <ListItemIcon>
                        <GroupIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        <Label>Manage users</Label>
                    </ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
