import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';
import React from 'react';
import { EmailAvatar } from '~/client/pages/products/EmailAvatar';

jest.mock('~/client/utils/gravatar', () => ({
    gravatarUrl: jest.fn(() => 'https://gravatar.example.com/hash'),
}));

jest.mock('~/client/state/profile/dev', () => ({
    DEV_MODE_EMAIL: 'dev@mo.de',
}));

describe('<EmailAvatar>', () => {
    it('renders nothing when email is undefined', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders robot avatar when email equals DEV_MODE_EMAIL', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="dev@mo.de" />
            </MockTheme>
        );

        expect(container.querySelector('[data-robot="true"]')).toBeInTheDocument();
    });

    it('renders robot avatar case-insensitively for DEV_MODE_EMAIL', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="DEV@MO.DE" />
            </MockTheme>
        );

        expect(container.querySelector('[data-robot="true"]')).toBeInTheDocument();
    });

    it('renders Avatar with gravatar URL when no profile or fallbackPicture', () => {
        const { gravatarUrl } = jest.requireMock('~/client/utils/gravatar');

        const { container } = render(
            <MockTheme>
                <EmailAvatar email="user@example.com" />
            </MockTheme>
        );

        expect(gravatarUrl).toHaveBeenCalledWith('user@example.com');
        expect(container.querySelector('img')).toHaveAttribute('src', 'https://gravatar.example.com/hash');
    });

    it('renders Avatar with profile.picture when provided', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar
                    email="user@example.com"
                    profile={{ email: 'user@example.com', picture: 'https://cdn.example.com/pic.jpg' }}
                />
            </MockTheme>
        );

        expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/pic.jpg');
    });

    it('renders Avatar with fallbackPicture when no profile picture', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar
                    email="user@example.com"
                    fallbackPicture="https://cdn.example.com/fallback.jpg"
                />
            </MockTheme>
        );

        expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/fallback.jpg');
    });

    it('has aria-label and title set to the email on the Avatar root element', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="user@example.com" />
            </MockTheme>
        );

        // Mantine Avatar places aria-label and title on the root div, not the inner img
        const root = container.querySelector('[aria-label="user@example.com"]');
        expect(root).toBeInTheDocument();
        expect(root).toHaveAttribute('title', 'user@example.com');
    });

    it('derives initials from a dotted email local-part (john.doe → JD)', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="john.doe@example.com" />
            </MockTheme>
        );

        // Mantine hides the placeholder span while the image is loading;
        // simulate an image load error so the initials become visible
        const img = container.querySelector('img');
        if (img) {
            fireEvent.error(img);
        }

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('derives a single initial from a simple local-part (alice → A)', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="alice@example.com" />
            </MockTheme>
        );

        const img = container.querySelector('img');
        if (img) {
            fireEvent.error(img);
        }

        expect(screen.getByText('A')).toBeInTheDocument();
    });
});
