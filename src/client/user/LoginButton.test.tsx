import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import { LoginButton } from '~/client/user/LoginButton';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('@react-oauth/google', () => ({
    useGoogleLogin: jest.fn(),
    useGoogleOneTapLogin: jest.fn(),
}));
jest.mock('~/client/user/hooks/useLoginError');
jest.mock('~/client/user/hooks/useLoginSuccess');

describe('LoginButton', () => {
    const login = jest.fn();
    const onError = jest.fn();
    const onSuccess = jest.fn();

    beforeEach(() => {
        (useGoogleLogin as jest.Mock).mockReturnValue(login);
        (useLoginError as jest.Mock).mockReturnValue(onError);
        (useLoginSuccess as jest.Mock).mockReturnValue(onSuccess);
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

        expect(login).toHaveBeenCalled();
    });

    it('calls Google one tap login on render', async () => {
        render(<LoginButton />, withReduxState());

        expect(useGoogleOneTapLogin).toHaveBeenCalledWith({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        });
    });

    it('calls error actions if login fails', async () => {
        (useGoogleOneTapLogin as jest.Mock).mockImplementationOnce(({ onError: handleError }) => handleError());

        render(<LoginButton />, withReduxState());

        expect(onError).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls success actions if login passes', async () => {
        (useGoogleOneTapLogin as jest.Mock).mockImplementationOnce(({ onSuccess: handleSuccess }) => handleSuccess());

        render(<LoginButton />, withReduxState());

        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});
