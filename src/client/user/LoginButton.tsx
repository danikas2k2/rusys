import GoogleIcon from '@icons/Google.svg';
import { type CredentialResponse, type TokenResponse, useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { type ButtonProps } from '@ui/Button';
import IconButton from '@ui/IconButton';
import { jwtDecode } from 'jwt-decode';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import Label from '~/client/Label';
import { resetProfileAction, setProfileAction } from '~/store/profile/actions';
import { type Profile } from '~/store/profile/types';
import useEmailCheck from '~/store/profile/useEmailCheck';
import cx from './LoginButton.less';

export default memo(function LoginButton({ children }: ButtonProps) {
    const dispatch = useDispatch();

    const emailCheck = useEmailCheck();
    const onSuccess = useCallback(
        async (response: CredentialResponse | TokenResponse) => {
            const data = (response as CredentialResponse)?.credential ?? (response as TokenResponse)?.access_token;
            if (data) {
                const profile = jwtDecode<Profile>(data);
                const { email } = profile;
                if (email) {
                    dispatch(setProfileAction(profile));
                    await emailCheck(email);
                    return;
                }
            }
            // reset profile if no response or email
            dispatch(resetProfileAction());
        },
        [dispatch, emailCheck]
    );

    const onError = useCallback(() => {
        dispatch(resetProfileAction());
    }, [dispatch]);

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
}, isEqual);
