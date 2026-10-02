import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { isDevMode } from '~/common/utils/dev';
import { AppContent } from '~/components/app/AppContent';
import { useProfile } from '~/store/profile';

vi.mock(import('~/common/utils/dev'));
vi.mock(import('~/store/profile/useProfile'));
vi.mock(import('~/components/app/AppRouter'), () => ({
    AppRouter: () => <div>AppRouter</div>,
}));
vi.mock(import('~/components/user/LoginButton'), () => ({
    LoginButton: () => <div>LoginButton</div>,
}));
vi.mock(import('~/components/user/LogoutButton'), () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));
vi.mock(import('~/components/common/ErrorDialog'), () => ({
    ErrorDialog: () => null,
}));

describe('<AppContent>', () => {
    beforeAll(() => {
        vi.mocked(isDevMode).mockReturnValue(false);
        vi.mocked(useProfile).mockReturnValue({ sub: undefined });
    });

    it('renders LoginButton when not has no profile info', () => {
        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('LoginButton')).toBeInTheDocument();
    });

    it('renders LogoutButton when has profile info but user is not allowed', () => {
        vi.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: false });

        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('renders AppRouter when has profile and user is.allowed', () => {
        vi.mocked(isDevMode).mockReturnValue(false);
        vi.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: true });

        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });

    it('renders AppRouter when in dev mode event without profile', () => {
        vi.mocked(isDevMode).mockReturnValue(true);

        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });
});
