import MenuIcon from '@icons/Menu.svg';
import IconButton from '@ui/IconButton';
import React, { memo, useState } from 'react';

export default memo(function Menu(): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <IconButton
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={() => setOpen(!open)}
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
});
