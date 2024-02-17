import { googleLogout } from '@react-oauth/google';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LogoutButton } from '~/client/user/LogoutButton';
import { useResetProfile } from '~/state/profile/useResetProfile';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('@react-oauth/google', () => ({
    googleLogout: jest.fn(),
}));
jest.mock('~/client/user/ProfileAvatar', () => () => <div>ProfileAvatar</div>);
jest.mock('~/state/profile/useResetProfile');

describe('LogoutButton', () => {
    const resetProfile = jest.fn();

    beforeAll(() => {
        (useResetProfile as jest.Mock).mockReturnValue(resetProfile);
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

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByText('Logout'));

        expect(googleLogout).toHaveBeenCalled();
        expect(resetProfile).toHaveBeenCalled();
    });
});
