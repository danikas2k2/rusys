import { render, screen } from '@testing-library/react';
import { mockEnv } from '@tests/mockEnv';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { App } from '~/client/App';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';

jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('~/client/AppContent', () => ({
    AppContent: () => <div>AppContent</div>,
}));
jest.mock('~/common/utils/env');
jest.mock('~/client/state/google/useClientId');

describe('<App>', () => {
    mockEnv();

    afterEach(() => jest.clearAllMocks());

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
        jest.mocked(isDevMode).mockReturnValueOnce(true);

        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when clientId is invalid', () => {
        jest.mocked(useClientId).mockReturnValueOnce('');

        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Invalid Client ID');
    });

    it('renders AppContent when clientId is valid', () => {
        jest.mocked(useClientId).mockReturnValueOnce('validId');

        render(
            <MockTheme>
                <App />
            </MockTheme>
        );

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
