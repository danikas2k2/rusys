import { Button } from '@mantine/core';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import React, { useCallback, useMemo } from 'react';

import { GoogleLoginIcon } from '@icons';

import { Label } from '~/components/common/Label';
import { useLoginError } from '~/components/user/hooks/useLoginError';
import { useLoginSuccess } from '~/components/user/hooks/useLoginSuccess';

export function LoginButton() {
    const onError = useLoginError();
    const onSuccess = useLoginSuccess(onError);

    const loginOptions = useMemo(
        () => ({
            onSuccess,
            onError,
            scope: 'openid email profile',
        }),
        [onError, onSuccess]
    );

    useGoogleOneTapLogin(loginOptions);
    const login = useGoogleLogin(loginOptions);

    const handleClick = useCallback(() => login(), [login]);

    return (
        <Button size="lg" color="primary" variant="outline" onClick={handleClick} data-action="login">
            <GoogleLoginIcon />
            <Label>Login with Google</Label>
        </Button>
    );
}
