import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import { useGoogleLogin, useGoogleOneTapLogin, type CredentialResponse } from '@react-oauth/google';
import React from 'react';

import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import { LoginButton } from '~/client/user/LoginButton';

vi.mock(import('@react-oauth/google'), () => ({
    useGoogleLogin: vi.fn(),
    useGoogleOneTapLogin: vi.fn(),
}));
vi.mock(import('~/client/user/hooks/useLoginError'));
vi.mock(import('~/client/user/hooks/useLoginSuccess'));

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
            <MockThemeRedux>
                <LoginButton />
            </MockThemeRedux>
        );

        expect(screen.getByText('Login with Google')).toBeInTheDocument();
    });

    it('calls Google login when button is clicked', async () => {
        render(
            <MockThemeRedux>
                <LoginButton />
            </MockThemeRedux>
        );

        expect(useGoogleLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
            scope: 'openid email profile',
        });
        expect(login).not.toHaveBeenCalled();

        await user.click(screen.getByText('Login with Google'));

        expect(login).toHaveBeenCalledWith();
    });

    it('calls Google one tap login on render', async () => {
        render(
            <MockThemeRedux>
                <LoginButton />
            </MockThemeRedux>
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
            <MockThemeRedux>
                <LoginButton />
            </MockThemeRedux>
        );

        expect(onError).toHaveBeenCalledWith();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls success actions if login passes', async () => {
        const credentialResponse: CredentialResponse = { credential: 'test-credential' };
        vi.mocked(useGoogleOneTapLogin).mockImplementationOnce(
            ({ onSuccess: handleSuccess }: Parameters<typeof useGoogleOneTapLogin>[0]) =>
                handleSuccess(credentialResponse)
        );

        render(
            <MockThemeRedux>
                <LoginButton />
            </MockThemeRedux>
        );

        expect(onSuccess).toHaveBeenCalledWith(credentialResponse);
        expect(onError).not.toHaveBeenCalled();
    });
});
