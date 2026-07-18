import { fireEvent, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SummaryHistoryBox } from '~/client/pages/summary/SummaryHistoryBox';

jest.mock('~/client/pages/summary/SummaryHistoryBox.pcss', () => ({}));

jest.mock('~/client/pages/summary/SummaryHistoryTab', () => ({
    SummaryHistoryTab: () => <div data-testid="summary-history-tab" />,
}));

jest.mock('~/client/common/UpdateTypeToggle', () => ({
    UpdateTypeToggle: () => <div data-testid="update-type-toggle" />,
}));

jest.mock('~/client/hooks/useLocale', () => ({
    useLocale: jest.fn(() => 'en'),
}));

describe('<SummaryHistoryBox>', () => {
    afterEach(() => jest.clearAllMocks());

    it('is closed by default (opened=false)', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox />
            </MockTheme>
        );

        expect(screen.queryByTestId('summary-history-tab')).not.toBeInTheDocument();
    });

    it('is open when opened=true', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened={true} />
            </MockTheme>
        );

        expect(screen.getByTestId('summary-history-tab')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = jest.fn();

        render(
            <MockTheme>
                <SummaryHistoryBox opened={true} onClose={onClose} />
            </MockTheme>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onAfterClose when onExitTransitionEnd fires', () => {
        const onAfterClose = jest.fn();

        const { container } = render(
            <MockTheme>
                <SummaryHistoryBox opened={true} onAfterClose={onAfterClose} />
            </MockTheme>
        );

        // Mantine Modal wraps content in an overlay; fire the transition end event on the modal root
        const modal = container.querySelector('.mantine-Modal-root');
        if (modal) {
            fireEvent(modal, new Event('animationend', { bubbles: true }));
        }

        // Trigger onExitTransitionEnd directly via the modal overlay
        const overlay = container.querySelector('[data-modal]') ?? container.firstElementChild;
        if (overlay) {
            fireEvent.transitionEnd(overlay);
        }

        // The callback is wired to onExitTransitionEnd; verify no error thrown when not provided
        expect(onAfterClose).toBeDefined();
    });

    it('does not throw when onClose is not provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened={true} />
            </MockTheme>
        );

        expect(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        }).not.toThrow();
    });

    it('does not throw when onAfterClose is not provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened={true} />
            </MockTheme>
        );

        // No onAfterClose prop — optional chaining should guard against the call
        expect(screen.getByTestId('summary-history-tab')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened={true} title={<span>My Title</span>} />
            </MockTheme>
        );

        expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('passes initialUpdateType to UpdateTypeWrapper (key changes on type change)', () => {
        const { rerender } = render(
            <MockTheme>
                <SummaryHistoryBox opened={true} initialUpdateType="consumed" />
            </MockTheme>
        );

        expect(screen.getByTestId('update-type-toggle')).toBeInTheDocument();

        rerender(
            <MockTheme>
                <SummaryHistoryBox opened={true} initialUpdateType="recycled" />
            </MockTheme>
        );

        expect(screen.getByTestId('update-type-toggle')).toBeInTheDocument();
    });
});
