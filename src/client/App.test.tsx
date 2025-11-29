import { act, render, screen } from '@testing-library/react';
import { mockEnv } from '@tests/mockEnv';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from '~/client/App';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';

let mockOnScriptLoadError: (() => void) | undefined;

vi.mock('@react-oauth/google', async () => ({
    GoogleOAuthProvider: vi.fn(
        ({ children, onScriptLoadError }: React.PropsWithChildren<{ onScriptLoadError?: () => void }>) => {
            mockOnScriptLoadError = onScriptLoadError;
            return <div>{children}</div>;
        }
    ),
}));
vi.mock('~/client/AppContent', async () => ({
    AppContent: () => <div>AppContent</div>,
}));
vi.mock('~/common/utils/env');
vi.mock('~/client/state/google/useClientId');

describe('<App>', () => {
    mockEnv();

    afterEach(() => vi.clearAllMocks());

    it('renders Loader when clientId is null', () => {
        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        expect(useClientId).toHaveBeenCalledWith();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders AppContent when dev mode is on even if clientId is null', () => {
        vi.mocked(isDevMode).mockReturnValueOnce(true);

        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when Google OAuth script fails to load', () => {
        vi.mocked(useClientId).mockReturnValueOnce('validId');

        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        act(() => mockOnScriptLoadError?.());

        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load Google OAuth script');
    });

    it('renders AppContent when clientId is valid', () => {
        vi.mocked(useClientId).mockReturnValueOnce('validId');

        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
