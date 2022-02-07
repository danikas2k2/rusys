import { google } from '@config';
import GoogleIcon from '@mui/icons-material/Google';
import { Avatar, Button } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline, GoogleLogout } from 'react-google-login';
import '~/App.css';
import CellarTable from '~/CellarTable';
import { Profile } from '~/types';

function App() {
    const [profile, setProfile] = useState<Profile>();

    const login = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        if ('tokenId' in response) {
            const profile = response.getBasicProfile();
            setProfile({
                tokenId: response.tokenId,
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl(),
                name: profile.getName(),
            });
        } else if ('code' in response) {
            setProfile({ code: response.code });
        }
    };

    const logout = (response?: any) => {
        response && console.error(response);
        setProfile(undefined);
    };

    return (
        <div className="App">
            {profile ? (
                (profile.email && google?.allowedUsers?.includes?.(profile.email) && (
                    <Box>
                        <CellarTable />
                    </Box>
                )) || (
                    <GoogleLogout
                        clientId={google?.clientId}
                        onLogoutSuccess={logout}
                        render={({ onClick, disabled }) => (
                            <Button onClick={onClick} disabled={disabled}>
                                <Avatar alt={profile?.name} src={profile?.imageUrl}>
                                    {profile?.name
                                        ?.split(' ')
                                        .slice(0, 2)
                                        .map((name) => name[0])
                                        .join('')}
                                </Avatar>
                            </Button>
                        )}
                    />
                )
            ) : (
                <GoogleLogin
                    clientId={google?.clientId}
                    onSuccess={login}
                    onFailure={logout}
                    cookiePolicy="single_host_origin"
                    scope="profile"
                    isSignedIn
                    render={({ onClick, disabled }) => (
                        <Button onClick={onClick} disabled={disabled}>
                            <GoogleIcon />
                        </Button>
                    )}
                />
            )}
        </div>
    );
}

export default App;
