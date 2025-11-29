import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { googleLogout } from '@react-oauth/google';

import { useResetProfile } from '~/client/state/profile/useResetProfile';
import { LogoutButton } from '~/client/user/LogoutButton';

vi.mock('@react-oauth/google', async () => ({
    googleLogout: vi.fn(),
}));
vi.mock('~/client/user/ProfileAvatar', async () => ({
    ProfileAvatar: () => <div>ProfileAvatar</div>,
}));
vi.mock('~/client/state/profile/useResetProfile');

describe('<LogoutButton>', () => {
    const resetProfile = vi.fn();

    beforeAll(() => vi.mocked(useResetProfile).mockReturnValue(resetProfile));

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

        await user.click(screen.getByRole('button', { name: 'ProfileAvatar' }));

        await user.click(await screen.findByRole('button', { name: 'Logout' }));

        expect(googleLogout).toHaveBeenCalledWith();
        expect(resetProfile).toHaveBeenCalledWith();
    });
});
