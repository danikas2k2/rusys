import { Google as GoogleIcon } from '@mui/icons-material';
import { Avatar, Button, Dialog, DialogActions, DialogTitle, Grid, IconButton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useDispatch } from 'react-redux';
import { Label } from '~/Label';
import { useClientId } from '~/store/google.selectors';
import { checkEmailAction, resetProfileAction, setProfileAction } from '~/store/profile.actions';
import { useProfile } from '~/store/profile.selectors';
import './Profile.css';

interface ButtonProps {
    children?: ReactNode;
}

export function ProfileAvatar() {
    const profile = useProfile();
    return (
        <Avatar alt={profile?.name} src={profile?.imageUrl} className="Avatar">
            {profile?.name
                ?.split(' ')
                .slice(0, 2)
                .map((name) => name[0])
                .join('')}
        </Avatar>
    );
}

interface LogoutButtonProps {
    onClick: () => void;
    disabled?: boolean;
    children?: ReactNode;
}

function LogoutButtonWithConfirmation({ onClick, disabled, children }: LogoutButtonProps) {
    const [open, setOpen] = useState(false);

    function onClose() {
        setOpen(false);
    }

    function onConfirm() {
        onClose();
        onClick();
    }

    return (
        <>
            <IconButton onClick={() => setOpen(true)} disabled={disabled} edge="end" size="small">
                {children || <ProfileAvatar />}
            </IconButton>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>
                    <Label>Sure to logout?</Label>
                </DialogTitle>
                <DialogActions>
                    <Button onClick={onClose}>
                        <Label>Decline</Label>
                    </Button>
                    <Button onClick={onConfirm} autoFocus>
                        <Label>Confirm</Label>
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export function LogoutButton({ children }: ButtonProps) {
    const dispatch = useDispatch();
    const clientId = useClientId();
    return clientId ? (
        <GoogleLogout
            clientId={clientId}
            onLogoutSuccess={() => dispatch(resetProfileAction())}
            render={({ onClick, disabled }) => (
                <LogoutButtonWithConfirmation onClick={onClick} disabled={disabled}>
                    {children}
                </LogoutButtonWithConfirmation>
            )}
        />
    ) : null;
}

export function LoginButton({ children }: ButtonProps) {
    const dispatch = useDispatch();
    const clientId = useClientId();
    return clientId ? (
        <GoogleLogin
            clientId={clientId}
            onSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
                if ('tokenId' in response) {
                    const profile = response.getBasicProfile();
                    const email = profile.getEmail();
                    dispatch(
                        setProfileAction({
                            tokenId: response.tokenId,
                            email,
                            imageUrl: profile.getImageUrl(),
                            name: profile.getName(),
                        })
                    );
                    dispatch(checkEmailAction(email));
                } else {
                    dispatch(resetProfileAction());
                }
            }}
            onFailure={(response?: any) => {
                response && console.error(response);
                dispatch(resetProfileAction());
            }}
            cookiePolicy="single_host_origin"
            scope="profile"
            isSignedIn
            render={({ onClick, disabled }) => (
                <IconButton onClick={onClick} disabled={disabled} color="primary">
                    <Grid container direction="column" justifyContent="center" alignItems="center">
                        {children || (
                            <>
                                <GoogleIcon fontSize="large" />
                                <Typography fontSize="medium">
                                    <Label>Login with Google</Label>
                                </Typography>
                            </>
                        )}
                    </Grid>
                </IconButton>
            )}
        />
    ) : null;
}
