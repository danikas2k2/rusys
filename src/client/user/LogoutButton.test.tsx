import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withReduxState } from '@tests/withReduxState';
import { LogoutButton } from '~/client/user/LogoutButton';
import { useResetProfile } from '~/state/profile/useResetProfile';
import { googleLogout } from '@react-oauth/google';

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
        render(<LogoutButton />, withReduxState());

        expect(screen.getByText('ProfileAvatar')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        render(<LogoutButton>Test Child</LogoutButton>, withReduxState());

        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('opens ConfirmationDialog when button is clicked', async () => {
        render(<LogoutButton />, withReduxState());

        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('calls googleLogout and dispatches resetProfileAction when confirm is clicked', async () => {
        render(<LogoutButton />, withReduxState());

        await userEvent.click(screen.getByRole('button', { name: 'ProfileAvatar' }));
        await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(googleLogout).toHaveBeenCalledWith();
        expect(resetProfile).toHaveBeenCalledWith();
    });
});
