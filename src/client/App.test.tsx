import { act, render, screen } from '@testing-library/react';
import { mockEnv } from '@tests/mockEnv';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

import { App } from '~/client/App';
import { useGoogleClientId } from '~/client/state/google/useGoogleClientId';
import { isDevMode } from '~/common/utils/dev';

jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('~/client/AppContent', () => ({
    AppContent: () => <div>AppContent</div>,
}));
jest.mock('~/common/utils/dev');
jest.mock('~/client/state/google/useGoogleClientId');

describe('<App>', () => {
    mockEnv();

    afterEach(() => jest.clearAllMocks());

    it('renders Loader when clientId is null', () => {
        render(
            <MockThemeRedux>
                <App />
            </MockThemeRedux>
        );

        expect(useGoogleClientId).toHaveBeenCalledWith();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders AppContent when dev mode is on even if clientId is null', () => {
        jest.mocked(isDevMode).mockReturnValueOnce(true);

        render(
            <MockThemeRedux>
                <App />
            </MockThemeRedux>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when Google OAuth script fails to load', () => {
        jest.mocked(useGoogleClientId).mockReturnValueOnce('validId');

        const mockGoogleOAuthProvider = jest.mocked(GoogleOAuthProvider);
        let onScriptLoadError: (() => void) | undefined;

        mockGoogleOAuthProvider.mockImplementation(
            ({ children, onScriptLoadError: onError }: React.PropsWithChildren<{ onScriptLoadError?: () => void }>) => {
                onScriptLoadError = onError;
                return <div>{children}</div>;
            }
        );

        render(
            <MockThemeRedux>
                <App />
            </MockThemeRedux>
        );

        // Simulate script load error
        expect(onScriptLoadError).toBeDefined();

        act(() => {
            onScriptLoadError?.();
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load Google OAuth script');
    });

    it('renders AppContent when clientId is valid', () => {
        jest.mocked(useGoogleClientId).mockReturnValueOnce('validId');

        render(
            <MockThemeRedux>
                <App />
            </MockThemeRedux>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
