import { google } from '@config';
import { Google as GoogleIcon } from '@mui/icons-material';
import { Avatar, Button, Dialog, DialogActions, DialogTitle, Grid, IconButton, Typography } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline, GoogleLogout } from 'react-google-login';
import { useDispatch } from 'react-redux';
import { Label } from '~/Label';
import { resetProfileAction, setProfileAction } from '~/store/profile.actions';
import { useProfile } from '~/store/profile.selectors';

interface ButtonProps {
    children?: ReactNode;
}

export function ProfileAvatar() {
    const profile = useProfile();
    return (
        <Avatar alt={profile?.name} src={profile?.imageUrl} sx={{ width: 32, height: 32 }}>
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
    return (
        <GoogleLogout
            clientId={google?.clientId}
            onLogoutSuccess={() => dispatch(resetProfileAction())}
            render={({ onClick, disabled }) => (
                <LogoutButtonWithConfirmation onClick={onClick} disabled={disabled}>
                    {children}
                </LogoutButtonWithConfirmation>
            )}
        />
    );
}

export function LoginButton({ children }: ButtonProps) {
    const dispatch = useDispatch();
    return (
        <GoogleLogin
            clientId={google?.clientId}
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
                            allowed: google?.allowedUsers?.includes?.(email),
                        })
                    );
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
    );
}
