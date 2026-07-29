import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useHasReviewGroups } from '~/client/pages/groups/hooks/useHasReviewGroups';
import { ToolbarReviewButton } from '~/client/toolbar/ToolbarReviewButton';

vi.mock(import('~/client/pages/groups/hooks/useHasReviewGroups'));

describe('<ToolbarReviewButton>', () => {
    const setActive = vi.fn();

    beforeEach(() => {
        vi.mocked(useHasReviewGroups).mockReturnValue(true);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders a review button', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ToolbarReviewButton />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();
    });

    it('calls setActive with review action on click', async () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ToolbarReviewButton />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Review' }));

        expect(setActive).toHaveBeenCalledWith({ action: 'review' });
    });

    it('is disabled when there are no groups flagged for review', () => {
        vi.mocked(useHasReviewGroups).mockReturnValue(false);

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ToolbarReviewButton />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Review' })).toBeDisabled();
    });

    it('is not disabled when there are groups flagged for review', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ToolbarReviewButton />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Review' })).not.toBeDisabled();
    });
});
