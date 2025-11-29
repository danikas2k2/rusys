import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { useGoogleLogin, useGoogleOneTapLogin, type CredentialResponse } from '@react-oauth/google';

import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import { LoginButton } from '~/client/user/LoginButton';

jest.mock('@react-oauth/google', () => ({
    useGoogleLogin: jest.fn(),
    useGoogleOneTapLogin: jest.fn(),
}));
jest.mock('~/client/user/hooks/useLoginError');
jest.mock('~/client/user/hooks/useLoginSuccess');

describe('<LoginButton>', () => {
    const login = jest.fn();
    const onError = jest.fn();
    const onSuccess = jest.fn();

    beforeEach(() => {
        jest.mocked(useGoogleLogin).mockReturnValue(login);
        jest.mocked(useLoginError).mockReturnValue(onError);
        jest.mocked(useLoginSuccess).mockReturnValue(onSuccess);
    });

    afterEach(() => jest.clearAllMocks());

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
        jest.mocked(useGoogleOneTapLogin).mockImplementationOnce(({ onError: handleError }) => handleError?.());

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
        jest.mocked(useGoogleOneTapLogin).mockImplementationOnce(({ onSuccess: handleSuccess }) =>
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
