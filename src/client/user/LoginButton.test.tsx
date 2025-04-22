import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withReduxState } from '@tests/withReduxState';
import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import { LoginButton } from '~/client/user/LoginButton';
import { useGoogleLogin, useGoogleOneTapLogin, type CredentialResponse } from '@react-oauth/google';

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
        render(<LoginButton />, withReduxState());

        expect(screen.getByText('Login with Google')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        render(<LoginButton>Test Child</LoginButton>, withReduxState());

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('calls Google login when button is clicked', async () => {
        render(<LoginButton />, withReduxState());

        expect(useGoogleLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        });
        expect(login).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('Login with Google'));

        expect(login).toHaveBeenCalledWith();
    });

    it('calls Google one tap login on render', async () => {
        render(<LoginButton />, withReduxState());

        expect(useGoogleOneTapLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        });
    });

    it('calls error actions if login fails', async () => {
        jest.mocked(useGoogleOneTapLogin).mockImplementationOnce(({ onError: handleError }) => handleError?.());

        render(<LoginButton />, withReduxState());

        expect(onError).toHaveBeenCalledWith();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls success actions if login passes', async () => {
        const credentialResponse: CredentialResponse = { credential: 'test-credential' };
        jest.mocked(useGoogleOneTapLogin).mockImplementationOnce(({ onSuccess: handleSuccess }) =>
            handleSuccess(credentialResponse)
        );

        render(<LoginButton />, withReduxState());

        expect(onSuccess).toHaveBeenCalledWith(credentialResponse);
        expect(onError).not.toHaveBeenCalled();
    });
});
