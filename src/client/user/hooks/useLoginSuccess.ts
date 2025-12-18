import type { CredentialResponse, TokenResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';

import type { Profile } from '~/client/state/profile/types';
import { useEmailCheck } from '~/client/state/profile/useEmailCheck';
import { useSetProfile } from '~/client/state/profile/useSetProfile';

type GoogleUserInfo = Partial<Profile> & {
    email?: string;
    sub?: string;
};

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
        throw new Error(`Google userinfo failed: ${res.status}`);
    }
    return (await res.json()) as GoogleUserInfo;
}

export function useLoginSuccess(
    onError: () => void
): (response: CredentialResponse | TokenResponse) => Promise<boolean> {
    const emailCheck = useEmailCheck();
    const setProfile = useSetProfile();
    return useCallback(
        async (response: CredentialResponse | TokenResponse) => {
            try {
                const credential = (response as CredentialResponse).credential;
                const accessToken = (response as TokenResponse).access_token;

                let profile: Profile | undefined;

                if (credential) {
                    // One Tap provides an ID token (JWT) which we can decode locally.
                    profile = jwtDecode<Profile>(credential);
                } else if (accessToken) {
                    // `useGoogleLogin` returns an OAuth access token (usually not a JWT).
                    // Fetch profile via OIDC userinfo.
                    profile = (await fetchGoogleUserInfo(accessToken)) as Profile;
                }

                const email = profile?.email;
                if (profile && email) {
                    setProfile(profile);
                    await emailCheck(email);
                    return true;
                }
            } catch {
                // handled below
            }

            onError();
            return false;
        },
        [emailCheck, onError, setProfile]
    );
}
