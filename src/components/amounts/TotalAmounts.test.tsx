import { render } from '@testing-library/react';

import React from 'react';

import { AmountSuffix } from '~/components/amounts/AmountSuffix';
import { TotalAmounts } from '~/components/amounts/TotalAmounts';
import { useGroupVariantComparator } from '~/store/variants/useGroupVariantComparator';
import { useVariantsByGroup } from '~/store/variants/useVariantsByGroup';

vi.mock(import('~/store/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn().mockReturnValue(() => 0),
}));
vi.mock(import('~/components/amounts/AmountSuffix'), () => ({
    AmountSuffix: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/store/variants/useVariantsByGroup'), () => ({
    useVariantsByGroup: vi.fn().mockReturnValue([]),
}));

const NOW = new Date().getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

describe('<TotalAmounts>', () => {
    const group = 'Daržovės';

    afterEach(() => vi.clearAllMocks());

    it('sums undated amounts into a single row with no expiry-status attribute', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([
            { group, variant: 'p', order: 0, units: 'ml', count: 500 },
            { group, variant: 'd', order: 1, units: 'ml', count: 500 },
        ]);

        const { container } = render(
            <TotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 2 },
                    { variant: 'd', amount: 1 },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).not.toHaveAttribute('data-expires');
        expect(rows[0]).toHaveTextContent('1½l');
    });

    it('sums weight-based (g/kg) amounts and formats them like formatWeight', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'g', count: 500 }]);

        const { container } = render(<TotalAmounts group={group} amounts={[{ variant: 'p', amount: 2 }]} />);

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveTextContent('1kg');
    });

    it('sums a no-expiry entry together with a not-yet-soon dated entry into the same row', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'ml', count: 500 }]);

        const { container } = render(
            <TotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 2 },
                    { variant: 'p', amount: 1, expiresAt: NOW + 60 * DAY_MS },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(1);
        expect(rows[0]).not.toHaveAttribute('data-expires');
        expect(rows[0]).toHaveTextContent('1½l');
    });

    it('renders soon-expiring amounts as a separate row with data-expires="soon", before the valid row', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'ml', count: 500 }]);

        const { container } = render(
            <TotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 2 },
                    { variant: 'p', amount: 1, expiresAt: NOW + 5 * DAY_MS },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(2);
        expect(rows[0]).toHaveAttribute('data-expires', 'soon');
        expect(rows[0]).toHaveTextContent('½l');
        expect(rows[1]).not.toHaveAttribute('data-expires');
        expect(rows[1]).toHaveTextContent('1l');
    });

    it('renders expired amounts as a separate row with data-expires="expired", after the valid row', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'ml', count: 500 }]);

        const { container } = render(
            <TotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 2 },
                    { variant: 'p', amount: 1, expiresAt: NOW - 5 * DAY_MS },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(2);
        expect(rows[0]).not.toHaveAttribute('data-expires');
        expect(rows[0]).toHaveTextContent('1l');
        expect(rows[1]).toHaveAttribute('data-expires', 'expired');
        expect(rows[1]).toHaveTextContent('½l');
    });

    it('orders rows soon, valid, expired when all three are present, regardless of input order', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'ml', count: 500 }]);

        const { container } = render(
            <TotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 3, expiresAt: NOW - 5 * DAY_MS },
                    { variant: 'p', amount: 2 },
                    { variant: 'p', amount: 1, expiresAt: NOW + 5 * DAY_MS },
                ]}
            />
        );

        const rows = container.querySelectorAll('[data-amounts-row]');

        expect(rows).toHaveLength(3);
        expect(rows[0]).toHaveAttribute('data-expires', 'soon');
        expect(rows[0]).toHaveTextContent('½l');
        expect(rows[1]).not.toHaveAttribute('data-expires');
        expect(rows[1]).toHaveTextContent('1l');
        expect(rows[2]).toHaveAttribute('data-expires', 'expired');
        expect(rows[2]).toHaveTextContent('1½l');
    });

    describe('expiry status icon shown once per row, not per number', () => {
        it('renders no expiry icon on the valid row', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'ml', count: 500 }]);

            const { container } = render(<TotalAmounts group={group} amounts={[{ variant: 'p', amount: 2 }]} />);

            expect(container.querySelector('.tabler-icon-clock')).not.toBeInTheDocument();
            expect(container.querySelector('.tabler-icon-calendar-x')).not.toBeInTheDocument();
        });

        it('renders exactly one clock icon on the soon row, even with several values in it', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([
                { group, variant: 'p', order: 0, units: 'ml', count: 500 },
                { group, variant: 'd', order: 1, units: 'vnt' },
            ]);

            const { container } = render(
                <TotalAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                        { variant: 'd', amount: 2, expiresAt: NOW + 5 * DAY_MS },
                    ]}
                />
            );

            expect(container.querySelectorAll('.tabler-icon-clock')).toHaveLength(1);
        });

        it('renders exactly one calendar-x icon on the expired row', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([{ group, variant: 'p', order: 0, units: 'ml', count: 500 }]);

            const { container } = render(
                <TotalAmounts group={group} amounts={[{ variant: 'p', amount: 1, expiresAt: NOW - 5 * DAY_MS }]} />
            );

            expect(container.querySelectorAll('.tabler-icon-calendar-x')).toHaveLength(1);
        });
    });

    it('routes unitless amounts through VariantValueSpans within their row', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([]);

        render(
            <TotalAmounts
                group={group}
                amounts={[
                    { variant: 'p', amount: 3 },
                    { variant: 'p', amount: 1, expiresAt: NOW - 5 * DAY_MS },
                ]}
            />
        );

        expect(AmountSuffix).toHaveBeenCalledTimes(2);
    });

    it('calls useGroupVariantComparator with the group for the unitless fallback', () => {
        vi.mocked(useVariantsByGroup).mockReturnValue([]);

        render(<TotalAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

        expect(useGroupVariantComparator).toHaveBeenCalledWith(group);
    });

    describe('unitless amounts (no matching Variant units) sum within each expiry row', () => {
        it('sums a no-date entry and a not-yet-soon dated entry into one valid row', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([]);

            const { container } = render(
                <TotalAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 6 },
                        { variant: 'p', amount: 1, expiresAt: NOW + 60 * DAY_MS },
                    ]}
                />
            );

            const rows = container.querySelectorAll('[data-amounts-row]');

            expect(rows).toHaveLength(1);
            expect(rows[0]).not.toHaveAttribute('data-expires');
            expect(rows[0]).toHaveTextContent('7');
        });

        it('sums two differently-dated soon entries into one soon row', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([]);

            const { container } = render(
                <TotalAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                        { variant: 'p', amount: 1, expiresAt: NOW + 10 * DAY_MS },
                    ]}
                />
            );

            const rows = container.querySelectorAll('[data-amounts-row]');

            expect(rows).toHaveLength(1);
            expect(rows[0]).toHaveAttribute('data-expires', 'soon');
            expect(rows[0]).toHaveTextContent('2');
        });

        it('reproduces the reported scenario: 6 undated + 1 far-future + 2 soon (different dates) + 1 expired', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([]);

            const { container } = render(
                <TotalAmounts
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

        it('keeps different variants within the same row as separate values', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([]);

            const { container } = render(
                <TotalAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, expiresAt: NOW + 3 * DAY_MS },
                        { variant: 'd', amount: 2, expiresAt: NOW + 5 * DAY_MS },
                    ]}
                />
            );

            const rows = container.querySelectorAll('[data-amounts-row][data-expires="soon"]');

            expect(rows).toHaveLength(1);
            expect(rows[0].querySelectorAll('[data-value]')).toHaveLength(2);
        });
    });
});
