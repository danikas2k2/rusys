import { AddCircle } from '@mui/icons-material';
import { IconButton, Toolbar, Typography } from '@mui/material';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Label } from '~/Label';
import { LogoutButton } from '~/Profile';
import { addDetailsAction } from '~/store/details.actions';

export const CellarToolbar = () => {
    const dispatch = useDispatch();
    const addNewItem = () => {
        dispatch(addDetailsAction());
    };

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <IconButton edge="start" color="primary" onClick={addNewItem}>
                <AddCircle />
            </IconButton>
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                <Label>Cellar</Label>
            </Typography>
            <LogoutButton />
        </Toolbar>
    );
};
