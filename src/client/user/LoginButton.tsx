import GoogleIcon from '@icons/Google.svg';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { type ButtonProps, IconButton } from '@ui/Button';
import React, { useCallback, useMemo } from 'react';
import { Label } from '~/client/common/Label';
import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import cx from './LoginButton.less';

export function LoginButton({ children }: ButtonProps) {
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
            <div className={cx('LoginButton')}>
                {children || (
                    <>
                        <GoogleIcon />
                        <Label>Login with Google</Label>
                    </>
                )}
            </div>
        </IconButton>
    );
}
