import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { EmailAvatar } from '~/components/common/EmailAvatar';
import { gravatarUrl } from '~/lib/utils/gravatar';

vi.mock(import('~/lib/utils/gravatar'), (): any => ({
    gravatarUrl: vi.fn(() => 'https://gravatar.example.com/hash'),
}));

vi.mock(import('~/store/profile/dev'), (): any => ({
    DEV_MODE_EMAIL: 'dev@mo.de',
}));

describe('<EmailAvatar>', () => {
    it('renders anonymous avatar when email is undefined', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar />
            </MockTheme>
        );

        expect(container.querySelector('[data-anonymous="true"]')).toBeInTheDocument();
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
                <EmailAvatar email="user@example.com" fallbackPicture="https://cdn.example.com/fallback.jpg" />
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
        fireEvent.error(container.querySelector('img')!);

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('derives a single initial from a simple local-part (alice → A)', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="alice@example.com" />
            </MockTheme>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('falls back to the first character of the email when the local-part has no initials (all separators)', () => {
        const { container } = render(
            <MockTheme>
                <EmailAvatar email="...@example.com" />
            </MockTheme>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(screen.getByText('.')).toBeInTheDocument();
    });
});
