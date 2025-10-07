import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useGoogleLogin, useGoogleOneTapLogin, type CredentialResponse } from '@react-oauth/google';

import { useLoginError } from '~/client/app/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/app/user/hooks/useLoginSuccess';
import { LoginButton } from '~/client/app/user/LoginButton';

jest.mock('@react-oauth/google', () => ({
    useGoogleLogin: jest.fn(),
    useGoogleOneTapLogin: jest.fn(),
}));
jest.mock('~/client/app/user/hooks/useLoginError');
jest.mock('~/client/app/user/hooks/useLoginSuccess');

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
            <MockRedux>
                <LoginButton />
            </MockRedux>
        );

        expect(screen.getByText('Login with Google')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        render(
            <MockRedux>
                <LoginButton>Test Child</LoginButton>
            </MockRedux>
        );

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('calls Google login when button is clicked', async () => {
        render(
            <MockRedux>
                <LoginButton />
            </MockRedux>
        );

        expect(useGoogleLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        });
        expect(login).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('Login with Google'));

        expect(login).toHaveBeenCalledWith();
    });

    it('calls Google one tap login on render', async () => {
        render(
            <MockRedux>
                <LoginButton />
            </MockRedux>
        );

        expect(useGoogleOneTapLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        });
    });

    it('calls error actions if login fails', async () => {
        jest.mocked(useGoogleOneTapLogin).mockImplementationOnce(({ onError: handleError }) => handleError?.());

        render(
            <MockRedux>
                <LoginButton />
            </MockRedux>
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
            <MockRedux>
                <LoginButton />
            </MockRedux>
        );

        expect(onSuccess).toHaveBeenCalledWith(credentialResponse);
        expect(onError).not.toHaveBeenCalled();
    });
});
