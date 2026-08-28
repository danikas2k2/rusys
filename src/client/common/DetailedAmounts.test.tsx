import { render, screen } from '@testing-library/react';

import React from 'react';

import { DetailedAmounts } from '~/client/common/DetailedAmounts';

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn().mockReturnValue(() => 0),
}));
vi.mock(import('~/client/common/AmountSuffix'), () => ({
    AmountSuffix: vi.fn().mockReturnValue(null),
}));

const NOW = new Date().getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

describe('<DetailedAmounts>', () => {
    const group = 'Daržovės';

    afterEach(() => vi.clearAllMocks());

    it('renders a single row with no data-expires when there is no dated entry', () => {
        const { container } = render(<DetailedAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).not.toHaveAttribute('data-expires');
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders a single row with no data-expires when the date is well in the future', () => {
        const { container } = render(
            <DetailedAmounts group={group} amounts={[{ variant: 'p', amount: 3, expiresAt: NOW + 60 * DAY_MS }]} />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).not.toHaveAttribute('data-expires');
    });

    it('renders one row with data-expires="soon" for a soon-expiring entry', () => {
        const { container } = render(
            <DetailedAmounts group={group} amounts={[{ variant: 'p', amount: 3, expiresAt: NOW + 5 * DAY_MS }]} />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveAttribute('data-expires', 'soon');
    });

    it('renders one row with data-expires="expired" for an already-expired entry', () => {
        const { container } = render(
            <DetailedAmounts group={group} amounts={[{ variant: 'p', amount: 3, expiresAt: NOW - 5 * DAY_MS }]} />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveAttribute('data-expires', 'expired');
    });

    it('merges differently-dated entries of the same variant that share the same resulting status', () => {
        const { container } = render(
            <DetailedAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                    { variant: 'p', amount: 2, expiresAt: NOW + 10 * DAY_MS },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveAttribute('data-expires', 'soon');
        expect(rows[0]).toHaveTextContent('3');
    });

    it('reproduces the reported scenario: 6 undated + 1 far-future + 2 soon (different dates) + 1 expired, all for the same variant', () => {
        const { container } = render(
            <DetailedAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 6 },
                    { variant: 'p', amount: 1, expiresAt: NOW + 60 * DAY_MS },
                    { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                    { variant: 'p', amount: 1, expiresAt: NOW + 10 * DAY_MS },
                    { variant: 'p', amount: 1, expiresAt: NOW - 5 * DAY_MS },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(3);
        expect(rows[0]).toHaveAttribute('data-expires', 'soon');
        expect(rows[0]).toHaveTextContent('2');
        expect(rows[1]).not.toHaveAttribute('data-expires');
        expect(rows[1]).toHaveTextContent('7');
        expect(rows[2]).toHaveAttribute('data-expires', 'expired');
        expect(rows[2]).toHaveTextContent('1');
    });

    describe('row order: soon first (most urgent), then valid, then expired last', () => {
        it('orders rows soon, valid, expired regardless of input order', () => {
            const { container } = render(
                <DetailedAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, expiresAt: NOW - 5 * DAY_MS },
                        { variant: 'd', amount: 3 },
                        { variant: 'p', amount: 2, expiresAt: NOW + 5 * DAY_MS },
                    ]}
                />
            );

            const rows = container.querySelectorAll('[data-amounts-row]');

            expect(rows).toHaveLength(3);
            expect(rows[0]).toHaveAttribute('data-expires', 'soon');
            expect(rows[1]).not.toHaveAttribute('data-expires');
            expect(rows[2]).toHaveAttribute('data-expires', 'expired');
        });

        it('omits a row entirely when its bucket has no entries', () => {
            const { container } = render(
                <DetailedAmounts group={group} amounts={[{ variant: 'p', amount: 3, expiresAt: NOW + 5 * DAY_MS }]} />
            );

            const rows = container.querySelectorAll('[data-amounts-row]');

            expect(rows).toHaveLength(1);
            expect(rows[0]).toHaveAttribute('data-expires', 'soon');
        });
    });

    describe('expiry status icon shown once per row, not per value', () => {
        it('renders no expiry icon on the valid row', () => {
            const { container } = render(<DetailedAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

            expect(container.querySelector('.tabler-icon-clock')).not.toBeInTheDocument();
            expect(container.querySelector('.tabler-icon-calendar-x')).not.toBeInTheDocument();
        });

        it('renders exactly one clock icon for a soon row with several values', () => {
            const { container } = render(
                <DetailedAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                        { variant: 'd', amount: 2, expiresAt: NOW + 5 * DAY_MS },
                    ]}
                />
            );

            expect(container.querySelectorAll('.tabler-icon-clock')).toHaveLength(1);
        });

        it('renders exactly one calendar-x icon for an expired row with several values', () => {
            const { container } = render(
                <DetailedAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, expiresAt: NOW - 3 * DAY_MS },
                        { variant: 'd', amount: 2, expiresAt: NOW - 5 * DAY_MS },
                    ]}
                />
            );

            expect(container.querySelectorAll('.tabler-icon-calendar-x')).toHaveLength(1);
        });
    });

    it('keeps suspicious and home entries separate from plain entries within the same row', () => {
        const { container } = render(
            <DetailedAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                    { variant: 'p', amount: 2, expiresAt: NOW + 10 * DAY_MS, suspicious: true },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(container.querySelectorAll('[data-value]')).toHaveLength(2);
        expect(container.querySelector('[data-suspicious]')).toHaveTextContent('2');
        expect(container.querySelector('[data-value]:not([data-suspicious])')).toHaveTextContent('1');
    });
});
