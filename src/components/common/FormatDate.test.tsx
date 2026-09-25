import { render } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { FormatDate } from '~/components/common/FormatDate';

vi.mock(import('~/lib/hooks/useLabels'), () => ({
    useLabels: () => (s: string) => s,
}));

describe('<FormatDate>', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderDate(date: Date) {
        const { container } = render(
            <MockTheme>
                <FormatDate date={date} />
            </MockTheme>
        );
        return container;
    }

    it('renders only time when date is today', () => {
        const today = new Date('2024-06-15T09:30:00.000Z');
        const container = renderDate(today);

        expect(container.querySelector('[data-time]')).toBeInTheDocument();
        expect(container.querySelector('[data-date]')).not.toBeInTheDocument();
    });

    it('renders date and time when date is yesterday', () => {
        const yesterday = new Date('2024-06-14T09:30:00.000Z');
        const container = renderDate(yesterday);

        expect(container.querySelector('[data-date]')).toBeInTheDocument();
        expect(container.querySelector('[data-date]')).toHaveTextContent('Yesterday');
        expect(container.querySelector('[data-time]')).toBeInTheDocument();
    });

    it('renders weekday name when date is 2–6 days ago', () => {
        const twoDaysAgo = new Date('2024-06-13T09:30:00.000Z');
        const container = renderDate(twoDaysAgo);

        const dateEl = container.querySelector('[data-date]');

        expect(dateEl).toBeInTheDocument();
        expect(dateEl!.textContent).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
    });

    it('renders month and day when date is 7+ days ago in the same year', () => {
        const thirtyDaysAgo = new Date('2024-05-16T09:30:00.000Z');
        const container = renderDate(thirtyDaysAgo);

        const dateEl = container.querySelector('[data-date]');

        expect(dateEl).toBeInTheDocument();
        expect(dateEl!.textContent).toMatch(/May/);
        expect(dateEl!.textContent).toMatch(/16/);
        expect(dateEl!.textContent).not.toMatch(/2024/);
    });

    it('renders year, month and day when date is from a previous year', () => {
        const lastYear = new Date('2023-03-10T10:00:00.000Z');
        const container = renderDate(lastYear);

        const dateEl = container.querySelector('[data-date]');

        expect(dateEl).toBeInTheDocument();
        expect(dateEl!.textContent).toMatch(/2023/);
        expect(dateEl!.textContent).toMatch(/march|March/i);
        expect(dateEl!.textContent).toMatch(/10/);
    });

    it('does not render time when date is older than 3 months', () => {
        const old = new Date('2024-01-01T10:30:00.000Z'); // > 90 days before NOW (2024-06-15)
        const container = renderDate(old);

        expect(container.querySelector('[data-time]')).not.toBeInTheDocument();
    });

    it('renders time when date is within 3 months', () => {
        const recent = new Date('2024-06-14T09:30:00.000Z');
        const container = renderDate(recent);

        expect(container.querySelector('[data-time]')).toBeInTheDocument();
    });
});
