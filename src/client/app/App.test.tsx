import { render, screen } from '@testing-library/react';
import { mockEnv } from '@tests/mockEnv';

import React from 'react';

import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';

import { App } from '~/client/app/App';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';

jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('@ui/hooks/useDocumentColorScheme');
jest.mock('~/client/app/AppContent', () => ({
    AppContent: () => <div>AppContent</div>,
}));
jest.mock('~/common/utils/env');
jest.mock('~/client/state/google/useClientId');

describe('<App>', () => {
    mockEnv();

    afterEach(() => jest.clearAllMocks());

    it('initially calls useDocumentColorScheme and useLocale', () => {
        render(<App />);

        expect(useDocumentColorScheme).toHaveBeenCalledWith();
    });

    it('renders Loader when clientId is null', () => {
        render(<App />);

        expect(useClientId).toHaveBeenCalledWith();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders AppContent when dev mode is on even if clientId is null', () => {
        jest.mocked(isDevMode).mockReturnValueOnce(true);
        render(<App />);

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when clientId is invalid', () => {
        jest.mocked(useClientId).mockReturnValueOnce('');
        render(<App />);

        expect(screen.getByRole('alert')).toHaveTextContent('Invalid Client ID');
    });

    it('renders AppContent when clientId is valid', () => {
        jest.mocked(useClientId).mockReturnValueOnce('validId');
        render(<App />);

        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
