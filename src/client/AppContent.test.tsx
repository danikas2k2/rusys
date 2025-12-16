import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { AppContent } from '~/client/AppContent';
import { useProfile } from '~/client/state/profile/useProfile';
import { isDevMode } from '~/common/utils/dev';

jest.mock('~/common/utils/dev');
jest.mock('~/client/state/profile/useProfile');
jest.mock('~/client/AppRouter', () => ({
    AppRouter: () => <div>AppRouter</div>,
}));
jest.mock('~/client/user/LoginButton', () => ({
    LoginButton: () => <div>LoginButton</div>,
}));
jest.mock('~/client/user/LogoutButton', () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));
jest.mock('~/client/common/ErrorDialog', () => ({
    ErrorDialog: () => null,
}));

describe('<AppContent>', () => {
    beforeAll(() => {
        jest.mocked(isDevMode).mockReturnValue(false);
        jest.mocked(useProfile).mockReturnValue({ sub: undefined });
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
        jest.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: false });

        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('renders AppRouter when has profile and user is.allowed', () => {
        jest.mocked(isDevMode).mockReturnValue(false);
        jest.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: true });

        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });

    it('renders AppRouter when in dev mode event without profile', () => {
        jest.mocked(isDevMode).mockReturnValue(true);

        render(
            <MockRedux>
                <AppContent />
            </MockRedux>
        );

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });
});
