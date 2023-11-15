import ListAltIcon from '@icons/ListAlt.svg';
import IconButton from '@ui/IconButton';
import MenuItem from '@ui/MenuItem';
import { isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Label from '~/client/Label';
import { Links } from '~/client/Links';
import ToolbarMenuWrapper from '~/client/toolbar/ToolbarMenuWrapper';

export default memo(function SummaryMenu() {
    const navigate = useNavigate();
    const gotoDetails = useCallback((): void => navigate(Links.DETAILS), [navigate]);
    return (
        <ToolbarMenuWrapper>
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
        </ToolbarMenuWrapper>
    );
}, isEqual);
