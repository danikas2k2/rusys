import { act, renderHook } from '@testing-library/react';

import React from 'react';

import { IdentityProvider, useIdentity } from './IdentityContext';

describe('identityContext', () => {
    it('provides defaults and updates the profile', () => {
        const { result } = renderHook(useIdentity, { wrapper: IdentityProvider });

        expect(result.current.clientId).toBe('');
        expect(result.current.profile).toStrictEqual({});

        act(() => result.current.setProfile({ sub: 'user-1', allowed: true }));

        expect(result.current.profile).toStrictEqual({ sub: 'user-1', allowed: true });
    });

    it('provides the supplied client and initial profile', () => {
        const profile = { sub: 'user-2' };
        const { result } = renderHook(useIdentity, {
            wrapper: ({ children }) => (
                <IdentityProvider clientId="client-1" initialProfile={profile}>
                    {children}
                </IdentityProvider>
            ),
        });

        expect(result.current.clientId).toBe('client-1');
        expect(result.current.profile).toBe(profile);
    });

    it('requires a provider', () => {
        expect(() => renderHook(useIdentity)).toThrow('IdentityProvider is required');
    });
});
