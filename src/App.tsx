import { locale } from '@config';
import { Box } from '@mui/material';
import React from 'react';
import '~/App.css';
import CellarTable from '~/CellarTable';
import { LoginButton, LogoutButton } from '~/Profile';
import { useLocale } from '~/store/locale.selectors';
import { useProfile } from '~/store/profile.selectors';

function App() {
    useLocale(locale);
    const profile = useProfile();
    return (
        <div className="App">
            {profile.tokenId ? (
                (profile.allowed && (
                    <Box>
                        <CellarTable />
                    </Box>
                )) || <LogoutButton />
            ) : (
                <LoginButton />
            )}
        </div>
    );
}

export default App;
