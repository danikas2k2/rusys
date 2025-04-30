import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContent } from '~/client/AppContent';
import { isDevMode } from '~/common/utils/env';
import { useProfile } from '~/state/profile/useProfile';

jest.mock('~/common/utils/env');
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

describe('<AppContent>', () => {
    beforeAll(() => {
        jest.mocked(isDevMode).mockReturnValue(false);
        jest.mocked(useProfile).mockReturnValue({ sub: undefined });
    });

    it('renders LoginButton when not has no profile info', () => {
        render(<AppContent />);

        expect(screen.getByText('LoginButton')).toBeInTheDocument();
    });

    it('renders LogoutButton when has profile info but user is not allowed', () => {
        jest.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: false });
        render(<AppContent />);

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('renders AppRouter when has profile and user is.allowed', () => {
        jest.mocked(isDevMode).mockReturnValue(false);
        jest.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: true });
        render(<AppContent />);

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });

    it('renders AppRouter when in dev mode event without profile', () => {
        jest.mocked(isDevMode).mockReturnValue(true);
        render(<AppContent />);

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });
});
