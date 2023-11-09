import AddCircleIcon from '@icons/AddCircle.svg';
import ChartIcon from '@icons/Chart.svg';
import ListAltIcon from '@icons/ListAlt.svg';
import MenuIcon from '@icons/Menu.svg';
import ColorSchemeToggler from '@ui/ColorSchemeToggler';
import IconButton from '@ui/IconButton';
import Menu, { MenuDivider, MenuItem } from '@ui/Menu';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import EditBox from '~/client/details/dialogs/EditBox';
import Label from '~/client/Label';
import { Links } from '~/client/Links';

export default memo(function ToolbarMenu() {
    const navigate = useNavigate();
    const gotoDetails = useCallback((): void => navigate(Links.DETAILS), [navigate]);
    const gotoSummary = useCallback((): void => navigate(Links.SUMMARY), [navigate]);
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
            <Menu
                trigger={
                    <IconButton variant="plain" color="neutral">
                        <MenuIcon />
                    </IconButton>
                }
            >
                {location.pathname === Links.DETAILS && (
                    <>
                        <MenuItem
                            onClick={handleOpen}
                            startDecorator={
                                <IconButton variant="plain" color="positive">
                                    <AddCircleIcon />
                                </IconButton>
                            }
                        >
                            <Label>Add</Label>
                        </MenuItem>
                        <MenuItem
                            onClick={gotoSummary}
                            startDecorator={
                                <IconButton variant="plain" color="primary">
                                    <ChartIcon />
                                </IconButton>
                            }
                        >
                            <Label>Statistics</Label>
                        </MenuItem>
                    </>
                )}
                {location.pathname === Links.SUMMARY && (
                    <>
                        <MenuItem
                            onClick={gotoDetails}
                            startDecorator={
                                <IconButton variant="plain" color="primary">
                                    <ListAltIcon />
                                </IconButton>
                            }
                        >
                            <Label>List</Label>
                        </MenuItem>
                    </>
                )}
                <MenuDivider />
                <MenuItem>
                    <ColorSchemeToggler />
                </MenuItem>
            </Menu>
            {opened && <EditBox onClose={handleClose} name="" />}
        </>
    );
}, isEqual);
