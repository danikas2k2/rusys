import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useHasReviewGroups } from '~/client/pages/groups/hooks/useHasReviewGroups';
import { ReviewMenuItem } from '~/client/toolbar/items/ReviewMenuItem';

vi.mock(import('~/client/common/Label'));
vi.mock(import('~/client/pages/groups/hooks/useHasReviewGroups'));

describe('<ReviewMenuItem>', () => {
    const setActive = vi.fn();

    beforeEach(() => {
        vi.mocked(useHasReviewGroups).mockReturnValue(true);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders review label', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ReviewMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('calls setActive with review action on click', async () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ReviewMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Review'));

        expect(setActive).toHaveBeenCalledWith({ action: 'review' });
    });

    it('calls both onClick and setActive when onClick is provided', async () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ReviewMenuItem onClick={onClick} />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Review'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(setActive).toHaveBeenCalledWith({ action: 'review' });
    });

    it('is disabled when there are no groups flagged for review', () => {
        vi.mocked(useHasReviewGroups).mockReturnValue(false);

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ReviewMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByText('Review').closest('a')).toHaveAttribute('data-disabled', 'true');
    });

    it('is not disabled when there are groups flagged for review', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ReviewMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByText('Review').closest('a')).not.toHaveAttribute('data-disabled', 'true');
    });
});
