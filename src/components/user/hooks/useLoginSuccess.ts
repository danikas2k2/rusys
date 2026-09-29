import type { CredentialResponse, TokenResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { loginWithGoogle } from '~/server/actions/auth';
import { useSetProfile } from '~/store/profile/useSetProfile';

export function useLoginSuccess(
    onError: () => void
): (response: CredentialResponse | TokenResponse) => Promise<boolean> {
    const router = useRouter();
    const setProfile = useSetProfile();
    return useCallback(
        async (response: CredentialResponse | TokenResponse) => {
            try {
                const credential = (response as CredentialResponse).credential;
                const accessToken = (response as TokenResponse).access_token;
                if (credential || accessToken) {
                    const profile = await loginWithGoogle(credential || accessToken, credential ? 'id' : 'access');
                    setProfile(profile);
                    router.refresh();
                    return true;
                }
            } catch {
                // handled below
            }
            onError();
            return false;
        },
        [onError, router, setProfile]
    );
}
