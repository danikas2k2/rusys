import { render, screen } from '@testing-library/react';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import React from 'react';
import { App } from '~/client/App';
import { useDev } from '~/hooks/useDev';
import { useClientId } from '~/state/google/useClientId';
import { useLocale } from '~/state/locale/useLocale';
import { mockEnv } from '~/tests/mockEnv';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('@ui/hooks/useDocumentColorScheme');
jest.mock('~/client/AppContent', () => () => <div>AppContent</div>);
jest.mock('~/hooks/useDev');
jest.mock('~/state/google/useClientId');
jest.mock('~/state/locale/useLocale');

describe('App', () => {
    mockEnv();

    afterEach(() => jest.clearAllMocks());

    it('initially calls useDocumentColorScheme and useLocale', () => {
        process.env.LOCALE = 'de-AT';
        render(<App />, withReduxState());
        expect(useDocumentColorScheme).toHaveBeenCalledWith();
        expect(useLocale).toHaveBeenCalledWith('de-AT');
    });

    it('renders Loader when clientId is null', () => {
        render(<App />, withReduxState());
        expect(useClientId).toHaveBeenCalledWith();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders AppContent when dev mode is on even if clientId is null', () => {
        (useDev as jest.Mock).mockReturnValueOnce(true);
        render(<App />, withReduxState());
        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });

    it('renders Error when clientId is invalid', () => {
        (useClientId as jest.Mock).mockReturnValueOnce('');
        render(<App />, withReduxState());
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid Client ID');
    });

    it('renders AppContent when clientId is valid', () => {
        (useClientId as jest.Mock).mockReturnValueOnce('validId');
        render(<App />, withReduxState());
        expect(screen.getByText('AppContent')).toBeInTheDocument();
    });
});
