import { Button } from '@mantine/core';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import React, { useCallback, useMemo } from 'react';

import { Label } from '~/client/common/Label';
import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';

import './LoginButton.pcss';

export function LoginButton() {
    const onError = useLoginError();
    const onSuccess = useLoginSuccess(onError);

    const loginOptions = useMemo(
        () => ({
            onSuccess,
            onError,
        }),
        [onError, onSuccess]
    );

    useGoogleOneTapLogin(loginOptions);
    const login = useGoogleLogin(loginOptions);

    const handleClick = useCallback(() => login(), [login]);

    return (
        <Button size="lg" color="primary" variant="outline" onClick={handleClick} data-action="login">
            <IconBrandGoogleFilled />
            <Label>Login with Google</Label>
        </Button>
    );
}
