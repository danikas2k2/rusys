import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { DEV_MODE_SUB } from '~/client/state/profile/dev';
import { useProfile } from '~/client/state/profile/useProfile';
import { ProfileAvatar } from '~/client/user/ProfileAvatar';

jest.mock('~/client/state/profile/useProfile');

describe('<ProfileAvatar>', () => {
    afterEach(() => jest.clearAllMocks());

    it('renders nothing when profile does not exist', () => {
        jest.mocked(useProfile).mockReturnValueOnce({});

        const { container } = render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders image when profile picture exists', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ picture: 'test.jpg', name: 'Test User' });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        const avatar = screen.getByRole('figure');

        expect(avatar).toHaveAttribute('data-picture', 'true');
        expect(screen.getByRole('img', { name: 'Test User' })).toHaveAttribute('src', 'test.jpg');
    });

    it('renders initials when profile picture does not exist', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Test User' });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        const avatar = screen.getByRole('figure');

        expect(avatar).toHaveAttribute('data-picture', 'false');
        expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('renders initials when profile picture does not exist and name has multiple words', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Test User Name' });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-picture', 'false');
        expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('renders initials when profile picture and name does not exist but given_name and family_name does', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ given_name: 'Test', family_name: 'User' });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-picture', 'false');
        expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('renders robot icon when profile has dev flag', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Dev User', dev: true });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-robot', 'true');
    });

    it('renders robot icon when profile sub matches DEV_MODE_SUB', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Dev User', sub: DEV_MODE_SUB });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-robot', 'true');
    });

    it('renders robot icon with custom variant when profile has dev flag', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Dev User', dev: true });

        render(
            <MockTheme>
                <ProfileAvatar variant="filled" />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-robot', 'true');
    });

    it('renders initials when only given_name exists', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ given_name: 'Test' });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-picture', 'false');
        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('renders initials when only family_name exists', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ family_name: 'User' });

        render(
            <MockTheme>
                <ProfileAvatar />
            </MockTheme>
        );

        expect(screen.getByRole('figure')).toHaveAttribute('data-picture', 'false');
        expect(screen.getByText('U')).toBeInTheDocument();
    });
});
