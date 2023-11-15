import AddCircleIcon from '@icons/AddCircle.svg';
import ChartIcon from '@icons/Chart.svg';
import IconButton from '@ui/IconButton';
import MenuItem from '@ui/MenuItem';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditBox from '~/client/details/dialogs/EditBox';
import Label from '~/client/Label';
import { Links } from '~/client/Links';
import ToolbarMenuWrapper from '~/client/toolbar/ToolbarMenuWrapper';

export default memo(function DetailsMenu() {
    const navigate = useNavigate();
    const gotoSummary = useCallback((): void => navigate(Links.SUMMARY), [navigate]);

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
            <ToolbarMenuWrapper>
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
            </ToolbarMenuWrapper>
            {opened && <EditBox onClose={handleClose} name="" />}
        </>
    );
}, isEqual);
