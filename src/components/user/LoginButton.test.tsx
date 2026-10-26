import { act, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeData } from '@tests/MockThemeData';

import { useGoogleLogin, useGoogleOneTapLogin, type CredentialResponse } from '@react-oauth/google';
import React from 'react';

import { useLoginError } from '~/components/user/hooks/useLoginError';
import { useLoginSuccess } from '~/components/user/hooks/useLoginSuccess';
import { LoginButton } from '~/components/user/LoginButton';
import { trackFaroEvent } from '~/lib/observability/faro';

vi.mock(import('@react-oauth/google'), () => ({
    useGoogleLogin: vi.fn(),
    useGoogleOneTapLogin: vi.fn(),
}));
vi.mock(import('~/lib/observability/faro'), () => ({ trackFaroEvent: vi.fn() }));
vi.mock(import('~/components/user/hooks/useLoginError'));
vi.mock(import('~/components/user/hooks/useLoginSuccess'));

describe('<LoginButton>', () => {
    const login = vi.fn();
    const onError = vi.fn();
    const onSuccess = vi.fn();

    beforeEach(() => {
        vi.mocked(useGoogleLogin).mockReturnValue(login);
        vi.mocked(useLoginError).mockReturnValue(onError);
        vi.mocked(useLoginSuccess).mockReturnValue(onSuccess);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders Google login button', () => {
        render(
            <MockThemeData>
                <LoginButton />
            </MockThemeData>
        );

        expect(screen.getByText('Login with Google')).toBeInTheDocument();
    });

    it('calls Google login when button is clicked', async () => {
        render(
            <MockThemeData>
                <LoginButton />
            </MockThemeData>
        );

        expect(useGoogleLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
            scope: 'openid email profile',
        });
        expect(login).not.toHaveBeenCalled();

        await user.click(screen.getByText('Login with Google'));

        expect(login).toHaveBeenCalledWith();
        expect(trackFaroEvent).toHaveBeenCalledWith('auth', { action: 'login', result: 'started' });
    });

    it('calls Google one tap login on render', async () => {
        render(
            <MockThemeData>
                <LoginButton />
            </MockThemeData>
        );

        expect(useGoogleOneTapLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
            scope: 'openid email profile',
        });
    });

    it('calls error actions if login fails', async () => {
        vi.mocked(useGoogleOneTapLogin).mockImplementationOnce(
            ({ onError: handleError }: Parameters<typeof useGoogleOneTapLogin>[0]) => handleError?.()
        );

        render(
            <MockThemeData>
                <LoginButton />
            </MockThemeData>
        );

        expect(onError).toHaveBeenCalledWith();
        expect(trackFaroEvent).toHaveBeenCalledWith('auth', { action: 'login', result: 'error' });
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('records successful authentication without credentials', async () => {
        onSuccess.mockResolvedValueOnce(true);
        render(
            <MockThemeData>
                <LoginButton />
            </MockThemeData>
        );
        const options = vi.mocked(useGoogleOneTapLogin).mock.lastCall?.[0];

        await act(async () => {
            await options?.onSuccess({ credential: 'private-token' });
        });

        expect(onSuccess).toHaveBeenCalledWith({ credential: 'private-token' });
        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('auth', { action: 'login', result: 'success' });
    });

    it('calls success actions if login passes', async () => {
        const credentialResponse: CredentialResponse = { credential: 'test-credential' };
        vi.mocked(useGoogleOneTapLogin).mockImplementationOnce(
            ({ onSuccess: handleSuccess }: Parameters<typeof useGoogleOneTapLogin>[0]) =>
                handleSuccess(credentialResponse)
        );

        render(
            <MockThemeData>
                <LoginButton />
            </MockThemeData>
        );

        expect(onSuccess).toHaveBeenCalledWith(credentialResponse);
        expect(onError).not.toHaveBeenCalled();
    });
});
