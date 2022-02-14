import { Toolbar, Typography } from '@mui/material';
import * as React from 'react';
import CellarMenu from '~/CellarMenu';
import { Label } from '~/Label';
import { LogoutButton } from '~/Profile';

export const CellarToolbar = () => {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <CellarMenu />
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                <Label>Cellar</Label>
            </Typography>
            <LogoutButton />
        </Toolbar>
    );
};
