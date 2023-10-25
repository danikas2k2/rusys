import MenuIcon from '@icons/Menu.svg';
import IconButton from '@ui/IconButton';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';

export default memo(function Menu() {
    const [open, setOpen] = useState(false);
    const handleClick = useCallback(() => setOpen(!open), [open]);
    return (
        <div>
            <IconButton
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                className="edge-start"
                color="neutral"
                variant="plain"
            >
                <MenuIcon />
            </IconButton>
            {/*<Menu anchorEl={ref?.current} open={open} onClose={() => setOpen(!open)}>
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
            </Menu>*/}
        </div>
    );
}, isEqual);
