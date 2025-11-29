import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { useGoogleLogin, useGoogleOneTapLogin, type CredentialResponse } from '@react-oauth/google';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import { LoginButton } from '~/client/user/LoginButton';

vi.mock('@react-oauth/google', async () => ({
    useGoogleLogin: vi.fn(),
    useGoogleOneTapLogin: vi.fn(),
}));
vi.mock('~/client/user/hooks/useLoginError');
vi.mock('~/client/user/hooks/useLoginSuccess');

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
        });
    });

    it('calls error actions if login fails', async () => {
        vi.mocked(useGoogleOneTapLogin).mockImplementationOnce(({ onError: handleError }: { onError?: () => void }) =>
            handleError?.()
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
            ({ onSuccess: handleSuccess }: { onSuccess?: (response: CredentialResponse) => void }) =>
                handleSuccess?.(credentialResponse)
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
