import GoogleIcon from '@icons/Google.svg';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { type ButtonProps } from '@ui/Button';
import IconButton from '@ui/IconButton';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import Label from '~/client/Label';
import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import './LoginButton.less';

export default memo(function LoginButton({ children }: ButtonProps) {
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
        <IconButton color="neutral" variant="outlined" onClick={handleClick}>
            <div className="LoginButton">
                {children || (
                    <>
                        <GoogleIcon />
                        <Label>Login with Google</Label>
                    </>
                )}
            </div>
        </IconButton>
    );
}, isEqual);
