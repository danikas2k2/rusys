import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SummaryHistoryBox } from '~/features/summary/SummaryHistoryBox';

vi.mock(import('~/features/summary/SummaryHistoryTab'), () => ({
    SummaryHistoryTab: () => <section aria-label="Summary history" />,
}));
vi.mock(import('~/features/summary/SummaryYearBar'), () => ({
    SummaryYearBar: () => <nav aria-label="Summary years" />,
}));

vi.mock(import('~/lib/hooks/useLocale'), () => ({
    useLocale: vi.fn(() => 'en'),
}));

describe('<SummaryHistoryBox>', () => {
    afterEach(async () => {
        cleanup();
        // Mantine schedules focus restoration with a zero-delay timer when a
        // modal closes. Let it finish while JSDOM's document still exists.
        await new Promise((resolve) => setTimeout(resolve));
        vi.clearAllMocks();
    });

    it('is closed by default (opened=false)', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox />
            </MockTheme>
        );

        expect(screen.queryByRole('region', { name: 'Summary history' })).not.toBeInTheDocument();
    });

    it('is open when opened=true', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened />
            </MockTheme>
        );

        expect(screen.getByRole('region', { name: 'Summary history' })).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn();

        render(
            <MockTheme>
                <SummaryHistoryBox opened onClose={onClose} />
            </MockTheme>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onAfterClose is called after close', () => {
        const onAfterClose = vi.fn();

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

        expect(screen.getByRole('region', { name: 'Summary history' })).toBeInTheDocument();
    });

    it('calls onAfterClose after exit transition ends', async () => {
        const onAfterClose = vi.fn();

        const { rerender } = render(
            <MockTheme>
                <SummaryHistoryBox opened onAfterClose={onAfterClose} />
            </MockTheme>
        );

        const dialog = await screen.findByRole('dialog');

        rerender(
            <MockTheme>
                <SummaryHistoryBox opened={false} onAfterClose={onAfterClose} />
            </MockTheme>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });

    it('does not throw when the exit transition ends without onAfterClose', async () => {
        const { rerender } = render(
            <MockTheme>
                <SummaryHistoryBox opened />
            </MockTheme>
        );

        const dialog = await screen.findByRole('dialog');

        rerender(
            <MockTheme>
                <SummaryHistoryBox opened={false} />
            </MockTheme>
        );

        expect(() => {
            act(() => fireEvent.transitionEnd(dialog));
        }).not.toThrow();
    });

    it('renders title when provided', () => {
        render(
            <MockTheme>
                <SummaryHistoryBox opened title={<span>My Title</span>} />
            </MockTheme>
        );

        expect(screen.getByText('My Title')).toBeInTheDocument();
    });
});
