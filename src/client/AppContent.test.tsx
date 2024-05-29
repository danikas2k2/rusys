import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppContent } from '~/client/AppContent';
import { useDev } from '~/hooks/useDev';
import { useProfile } from '~/state/profile/useProfile';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/hooks/useDev');
jest.mock('~/state/profile/useProfile');
jest.mock('~/client/AppRouter', () => ({
    AppRouter: () => <div>AppRouter</div>,
}));
jest.mock('~/client/user/LoginButton', () => ({
    LoginButton: () => <div>LoginButton</div>,
}));
jest.mock('~/client/user/LogoutButton', () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));

describe('AppContent', () => {
    beforeAll(() => {
        (useDev as jest.Mock).mockReturnValue(false);
        (useProfile as jest.Mock).mockReturnValue({ sub: null });
    });

    it('renders LoginButton when not has no profile info', () => {
        render(<AppContent />, withReduxState());

        expect(screen.getByText('LoginButton')).toBeInTheDocument();
    });

    it('renders LogoutButton when has profile info but user is not allowed', () => {
        (useProfile as jest.Mock).mockReturnValue({ sub: 'test', allowed: false });

        render(<AppContent />, withReduxState());

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('renders AppRouter when has profile and user is.allowed', () => {
        (useDev as jest.Mock).mockReturnValue(false);
        (useProfile as jest.Mock).mockReturnValue({ sub: 'test', allowed: true });

        render(<AppContent />, withReduxState());

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });

    it('renders AppRouter when in dev mode event without profile', () => {
        (useDev as jest.Mock).mockReturnValue(true);

        render(<AppContent />, withReduxState());

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });
});
