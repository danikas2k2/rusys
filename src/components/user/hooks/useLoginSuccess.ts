import type { CredentialResponse, TokenResponse } from '@react-oauth/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useSetProfile } from '~/components/user/hooks/useSetProfile';
import type { LoginWithGoogle } from '~/schema';
import { loginWithGoogle } from '~/server/actions/auth';

export function useLoginSuccess(
    onError: () => void
): (response: CredentialResponse | TokenResponse) => Promise<boolean> {
    const router = useRouter();
    const queryClient = useQueryClient();
    const setProfile = useSetProfile();
    const login = useMutation({
        mutationFn: (request: LoginWithGoogle) => loginWithGoogle(request),
    });
    return useCallback(
        async (response: CredentialResponse | TokenResponse) => {
            try {
                const credential = (response as CredentialResponse).credential;
                const accessToken = (response as TokenResponse).access_token;
                if (credential || accessToken) {
                    const profile = await login.mutateAsync({
                        token: credential || accessToken,
                        kind: credential ? 'id' : 'access',
                    });
                    queryClient.clear();
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
        [login, onError, queryClient, router, setProfile]
    );
}
