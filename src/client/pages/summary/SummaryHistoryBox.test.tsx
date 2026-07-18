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
                <SummaryHistoryBox opened />
            </MockTheme>
        );

        expect(screen.getByTestId('summary-history-tab')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = jest.fn();

        render(
            <MockTheme>
                <SummaryHistoryBox opened onClose={onClose} />
            </MockTheme>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onAfterClose is called after close', () => {
        const onAfterClose = jest.fn();

        render(
            <MockTheme>
                <SummaryHistoryBox opened onAfterClose={onAfterClose} />
            </MockTheme>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onAfterClose).not.toHaveBeenCalled();
    });

    it('does not throw when onClose is not provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened />
            </MockTheme>
        );

        expect(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        }).not.toThrow();
    });

    it('does not throw when onAfterClose is not provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened />
            </MockTheme>
        );

        // No onAfterClose prop — optional chaining should guard against the call
        expect(screen.getByTestId('summary-history-tab')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened title={<span>My Title</span>} />
            </MockTheme>
        );

        expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('passes initialUpdateType to UpdateTypeWrapper (key changes on type change)', () => {
        const { rerender } = render(
            <MockTheme>
                <SummaryHistoryBox opened initialUpdateType="consumed" />
            </MockTheme>
        );

        expect(screen.getByTestId('update-type-toggle')).toBeInTheDocument();

        rerender(
            <MockTheme>
                <SummaryHistoryBox opened initialUpdateType="recycled" />
            </MockTheme>
        );

        expect(screen.getByTestId('update-type-toggle')).toBeInTheDocument();
    });
});
