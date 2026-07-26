import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveReviewBox } from '~/client/pages/review/ActiveReviewBox';

vi.mock(import('~/client/pages/review/ReviewBox'), (): any => ({
    ReviewBox: ({ opened, onClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Review box">
                <button type="button" onClick={() => onClose()}>
                    Close
                </button>
            </div>
        ) : null,
}));

describe('<ActiveReviewBox>', () => {
    const mockSetActive = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('renders closed when no active content', () => {
        render(
            <MockThemeActive>
                <ActiveReviewBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Review box' })).not.toBeInTheDocument();
    });

    it('renders closed when action is not review', () => {
        render(
            <MockThemeActive active={{ action: 'update' }}>
                <ActiveReviewBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Review box' })).not.toBeInTheDocument();
    });

    it('renders opened when action is review', () => {
        render(
            <MockThemeActive active={{ action: 'review' }}>
                <ActiveReviewBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Review box' })).toBeInTheDocument();
    });

    it('calls setActive with no args on close', async () => {
        render(
            <MockThemeActive active={{ action: 'review' }} setActive={mockSetActive}>
                <ActiveReviewBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });
});
