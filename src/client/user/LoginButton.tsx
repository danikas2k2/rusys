import React, { useCallback, useMemo, type PropsWithChildren } from 'react';

import { ActionIcon } from '@mantine/core';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { IconBrandGoogleFilled } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';
import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import cx from './LoginButton.pcss';

export function LoginButton({ children }: PropsWithChildren) {
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
        <ActionIcon color="gray" variant="outlined" onClick={handleClick}>
            <div className={cx('LoginButton')}>
                {children || (
                    <>
                        <IconBrandGoogleFilled />
                        <Label>Login with Google</Label>
                    </>
                )}
            </div>
        </ActionIcon>
    );
}
