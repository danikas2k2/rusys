import { render, screen } from '@testing-library/react';

import React from 'react';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AppContent } from '~/client/AppContent';
import { useProfile } from '~/client/state/profile/useProfile';
import { isDevMode } from '~/common/utils/env';

vi.mock('~/common/utils/env');
vi.mock('~/client/state/profile/useProfile');
vi.mock('~/client/AppRouter', () => ({
    AppRouter: () => <div>AppRouter</div>,
}));
vi.mock('~/client/user/LoginButton', () => ({
    LoginButton: () => <div>LoginButton</div>,
}));
vi.mock('~/client/user/LogoutButton', () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));

describe('<AppContent>', () => {
    beforeAll(() => {
        vi.mocked(isDevMode).mockReturnValue(false);
        vi.mocked(useProfile).mockReturnValue({ sub: undefined });
    });

    it('renders LoginButton when not has no profile info', () => {
        render(<AppContent />);

        expect(screen.getByText('LoginButton')).toBeInTheDocument();
    });

    it('renders LogoutButton when has profile info but user is not allowed', () => {
        vi.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: false });

        render(<AppContent />);

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('renders AppRouter when has profile and user is.allowed', () => {
        vi.mocked(isDevMode).mockReturnValue(false);
        vi.mocked(useProfile).mockReturnValue({ sub: 'test', allowed: true });

        render(<AppContent />);

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });

    it('renders AppRouter when in dev mode event without profile', () => {
        vi.mocked(isDevMode).mockReturnValue(true);

        render(<AppContent />);

        expect(screen.getByText('AppRouter')).toBeInTheDocument();
    });
});
