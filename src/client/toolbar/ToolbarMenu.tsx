import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuIcon from '@mui/icons-material/Menu';
import {
    Dropdown,
    IconButton,
    ListItemButton,
    ListItemContent,
    ListItemDecorator,
    Menu,
    MenuButton,
    MenuItem,
} from '@mui/joy';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import EditBox from '~/client/details/dialogs/EditBox';
import Label from '~/client/Label';
import { Links } from '~/client/Links';

export default memo(function ToolbarMenu() {
    const navigate = useNavigate();
    const handleTable = useCallback((): void => navigate(Links.DETAILS), [navigate]);
    const handleStatistics = useCallback((): void => navigate(Links.SUMMARY), [navigate]);
    const location = useLocation();

    const [opened, setOpened] = useState(false);
    const handleOpen = useCallback((): void => {
        if (!opened) {
            setOpened(true);
        }
    }, [opened, setOpened]);
    const handleClose = useCallback((): void => {
        if (opened) {
            setOpened(false);
        }
    }, [opened, setOpened]);

    return (
        <>
            <Dropdown>
                <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral' } }}>
                    <MenuIcon />
                </MenuButton>
                <Menu>
                    {location.pathname === Links.DETAILS && (
                        <>
                            <MenuItem>
                                <ListItemButton onClick={handleOpen}>
                                    <ListItemDecorator>
                                        <AddCircleIcon color="success" />
                                    </ListItemDecorator>
                                    <ListItemContent>
                                        <Label>Add</Label>
                                    </ListItemContent>
                                </ListItemButton>
                            </MenuItem>
                            <MenuItem>
                                <ListItemButton onClick={handleStatistics}>
                                    <ListItemDecorator>
                                        <AssessmentIcon color="primary" />
                                    </ListItemDecorator>
                                    <ListItemContent>
                                        <Label>Statistics</Label>
                                    </ListItemContent>
                                </ListItemButton>
                            </MenuItem>
                        </>
                    )}
                    {location.pathname === Links.SUMMARY && (
                        <>
                            <MenuItem>
                                <ListItemButton onClick={handleTable}>
                                    <ListItemDecorator>
                                        <ListAltIcon color="primary" />
                                    </ListItemDecorator>
                                    <ListItemContent>
                                        <Label>List</Label>
                                    </ListItemContent>
                                </ListItemButton>
                            </MenuItem>
                        </>
                    )}
                </Menu>
            </Dropdown>
            {opened && <EditBox onClose={handleClose} name="" />}
        </>
    );
}, isEqual);
