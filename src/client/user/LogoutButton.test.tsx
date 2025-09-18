import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { googleLogout } from '@react-oauth/google';

import { LogoutButton } from '~/client/user/LogoutButton';
import { useResetProfile } from '~/state/profile/useResetProfile';

jest.mock('@react-oauth/google', () => ({
    googleLogout: jest.fn(),
}));
jest.mock('~/client/user/ProfileAvatar', () => ({
    ProfileAvatar: () => <div>ProfileAvatar</div>,
}));
jest.mock('~/state/profile/useResetProfile');

describe('<LogoutButton>', () => {
    const resetProfile = jest.fn();

    beforeAll(() => {
        jest.mocked(useResetProfile).mockReturnValue(resetProfile);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders ProfileAvatar when no children are provided', () => {
        render(
            <MockRedux>
                <LogoutButton />
            </MockRedux>
        );

        expect(screen.getByText('ProfileAvatar')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        render(
            <MockRedux>
                <LogoutButton>Test Child</LogoutButton>
            </MockRedux>
        );

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('opens ConfirmationDialog when button is clicked', async () => {
        render(
            <MockRedux>
                <LogoutButton />
            </MockRedux>
        );

        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('calls googleLogout and dispatches resetProfileAction when confirm is clicked', async () => {
        render(
            <MockRedux>
                <LogoutButton />
            </MockRedux>
        );

        await userEvent.click(screen.getByRole('button', { name: 'ProfileAvatar' }));
        await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(googleLogout).toHaveBeenCalledWith();
        expect(resetProfile).toHaveBeenCalledWith();
    });
});
