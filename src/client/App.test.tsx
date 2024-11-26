import { render, screen } from '@testing-library/react';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import React from 'react';
import { App } from '~/client/App';
import { useDev } from '~/common/hooks/useDev';
import { useClientId } from '~/state/google/useClientId';
import { mockEnv } from '~/tests/mockEnv';

jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('@ui/hooks/useDocumentColorScheme');
jest.mock('~/client/AppContent', () => ({
    AppContent: () => <div>AppContent</div>,
}));
jest.mock('~/common/hooks/useDev');
jest.mock('~/state/google/useClientId');

describe('App', () => {
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
        (useDev as jest.Mock).mockReturnValueOnce(true);
        render(<App />);
        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when clientId is invalid', () => {
        (useClientId as jest.Mock).mockReturnValueOnce('');
        render(<App />);
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid Client ID');
    });

    it('renders AppContent when clientId is valid', () => {
        (useClientId as jest.Mock).mockReturnValueOnce('validId');
        render(<App />);
        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
