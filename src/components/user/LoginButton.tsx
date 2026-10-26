import { Button } from '@mantine/core';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import React, { useCallback, useMemo } from 'react';

import { GoogleLoginIcon } from '@icons';

import { Label } from '~/components/common/Label';
import { useLoginError } from '~/components/user/hooks/useLoginError';
import { useLoginSuccess } from '~/components/user/hooks/useLoginSuccess';
import { trackFaroEvent } from '~/lib/observability/faro';

import './LoginButton.css';

export function LoginButton() {
    const resetOnError = useLoginError();
    const onError = useCallback(() => {
        trackFaroEvent('auth', { action: 'login', result: 'error' });
        resetOnError();
    }, [resetOnError]);
    const loginSuccess = useLoginSuccess(onError);
    const onSuccess = useCallback(
        async (response: Parameters<typeof loginSuccess>[0]) => {
            const success = await loginSuccess(response);
            if (success) {
                trackFaroEvent('auth', { action: 'login', result: 'success' });
            }
        },
        [loginSuccess]
    );

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

    const handleClick = useCallback(() => {
        trackFaroEvent('auth', { action: 'login', result: 'started' });
        login();
    }, [login]);

    return (
        <Button size="lg" color="primary" variant="outline" onClick={handleClick} data-action="login">
            <GoogleLoginIcon />
            <Label>Login with Google</Label>
        </Button>
    );
}
