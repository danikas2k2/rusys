import { useCallback } from 'react';
import { type Profile } from '~/state/profile/types';
import { useEmailCheck } from '~/state/profile/useEmailCheck';
import { useSetProfile } from '~/state/profile/useSetProfile';
import { type CredentialResponse, type TokenResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export function useLoginSuccess(
    onError: () => void
): (response: CredentialResponse | TokenResponse) => Promise<boolean> {
    const emailCheck = useEmailCheck();
    const setProfile = useSetProfile();
    return useCallback(
        async (response: CredentialResponse | TokenResponse) => {
            const data = (response as CredentialResponse)?.credential ?? (response as TokenResponse)?.access_token;
            if (data) {
                const profile = jwtDecode<Profile>(data);
                const { email } = profile;
                if (email) {
                    setProfile(profile);
                    await emailCheck(email);
                    return true;
                }
            }

            onError();
            return false;
        },
        [emailCheck, onError, setProfile]
    );
}
