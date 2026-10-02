import { act, render, screen } from '@testing-library/react';
import { mockEnv } from '@tests/mockEnv';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

import { isDevMode } from '~/common/utils/dev';
import { App } from '~/components/app/App';
import { useGoogleClientId } from '~/store/google';

vi.mock(import('@react-oauth/google'), () => ({
    GoogleOAuthProvider: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));
vi.mock(import('~/components/app/AppContent'), () => ({
    AppContent: () => <div>AppContent</div>,
}));
vi.mock(import('~/common/utils/dev'));
vi.mock(import('~/store/google/useGoogleClientId'));

describe('<App>', () => {
    mockEnv();

    afterEach(() => vi.clearAllMocks());

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
        vi.mocked(isDevMode).mockReturnValueOnce(true);

        render(
            <MockThemeRedux>
                <App />
            </MockThemeRedux>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when Google OAuth script fails to load', () => {
        vi.mocked(useGoogleClientId).mockReturnValueOnce('validId');

        const mockGoogleOAuthProvider = vi.mocked(GoogleOAuthProvider);
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
        vi.mocked(useGoogleClientId).mockReturnValueOnce('validId');

        render(
            <MockThemeRedux>
                <App />
            </MockThemeRedux>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
