import { render, screen } from '@testing-library/react';

import React from 'react';

import { ProfileAvatar } from '~/client/user/ProfileAvatar';
import { useProfile } from '~/state/profile/useProfile';

jest.mock('~/state/profile/useProfile');

describe('<ProfileAvatar>', () => {
    afterEach(() => jest.clearAllMocks());

    it('renders nothing when profile does not exist', () => {
        jest.mocked(useProfile).mockReturnValueOnce({});

        const { container } = render(<ProfileAvatar />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders image when profile picture exists', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ picture: 'test.jpg', name: 'Test User' });

        render(<ProfileAvatar />);

        expect(screen.getByRole('img', { name: 'Test User' })).toHaveAttribute('src', 'test.jpg');
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.queryByText('TU')).not.toBeInTheDocument();
    });

    it('renders initials when profile picture does not exist', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Test User' });

        render(<ProfileAvatar />);

        expect(screen.getByText('TU')).toBeInTheDocument();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders initials when profile picture does not exist and name has multiple words', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ name: 'Test User Name' });

        render(<ProfileAvatar />);

        expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('renders initials when profile picture and name does not exist but given_name and family_name does', () => {
        jest.mocked(useProfile).mockReturnValueOnce({ given_name: 'Test', family_name: 'User' });

        render(<ProfileAvatar />);

        expect(screen.getByText('TU')).toBeInTheDocument();
    });
});
