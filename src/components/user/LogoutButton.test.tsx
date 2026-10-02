import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import { googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useResetProfile } from '~/components/user/hooks/useResetProfile';
import { LogoutButton } from '~/components/user/LogoutButton';
import { logout } from '~/server/actions/auth';

vi.mock(import('@react-oauth/google'), () => ({
    googleLogout: vi.fn(),
}));
vi.mock(import('next/navigation'), () => ({ useRouter: vi.fn() }));
vi.mock(import('~/server/actions/auth'), () => ({ logout: vi.fn() }));
vi.mock(import('~/components/user/ProfileAvatar'), () => ({
    ProfileAvatar: () => <div>ProfileAvatar</div>,
}));
vi.mock(import('~/components/user/hooks/useResetProfile'));

describe('<LogoutButton>', () => {
    const resetProfile = vi.fn();
    const refresh = vi.fn();

    beforeAll(() => {
        vi.mocked(useResetProfile).mockReturnValue(resetProfile);
        vi.mocked(useRouter).mockReturnValue({ refresh } as any);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders ProfileAvatar when no children are provided', () => {
        render(
            <MockThemeRedux>
                <LogoutButton />
            </MockThemeRedux>
        );

        expect(screen.getByText('ProfileAvatar')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        render(
            <MockThemeRedux>
                <LogoutButton>Test Child</LogoutButton>
            </MockThemeRedux>
        );

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('opens ConfirmationDialog when button is clicked', async () => {
        render(
            <MockThemeRedux>
                <LogoutButton />
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('calls googleLogout and dispatches resetProfileAction when confirm is clicked', async () => {
        render(
            <MockThemeRedux>
                <LogoutButton />
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Logout' }));

        await user.click(await within(screen.getByRole('alertdialog')).findByRole('button', { name: 'Logout' }));

        expect(googleLogout).toHaveBeenCalledWith();
        expect(resetProfile).toHaveBeenCalledWith();
        expect(logout).toHaveBeenCalledWith();
        expect(refresh).toHaveBeenCalledWith();
    });
});
