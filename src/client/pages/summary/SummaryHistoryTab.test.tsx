import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import type { SummaryHistoryData } from '~/client/pages/summary/SummaryCell';
import { SummaryHistoryTab } from '~/client/pages/summary/SummaryHistoryTab';
import type { History } from '~/types/data';

jest.mock('~/client/state/history/useGetSummaryHistory', () => ({
    useGetSummaryHistory: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
}));

jest.mock('~/client/hooks/useLockingLoader', () => ({
    useLockingLoader: jest.fn(() => 'complete'),
    LoadingState: { INITIAL: 'initial', LOADING: 'loading', COMPLETE: 'complete', FAILED: 'failed' },
}));

jest.mock('~/client/state/history/useUpdates', () => ({
    useUpdates: jest.fn(() => []),
}));

jest.mock('~/client/state/history/useUndates', () => ({
    useUndates: jest.fn(() => []),
}));

jest.mock('~/client/common/UpdateTypeContext', () => ({
    useUpdateType: jest.fn(() => ['consumed', jest.fn()]),
}));

jest.mock('~/client/pages/products/EmailAvatar', () => ({
    EmailAvatar: jest.fn(() => null),
}));

jest.mock('~/client/pages/products/AmountsCell', () => ({
    AmountsCell: jest.fn(({ amounts }: any) => <span data-testid="amounts">{amounts.length}</span>),
}));

describe('<SummaryHistoryTab>', () => {
    const activeData: SummaryHistoryData = {
        group: 'Vaisiai',
        name: 'Obuoliai',
        year: 2026,
        amounts: [],
        updateType: 'consumed',
    };

    beforeEach(() => {
        // Reset overrideable mocks to their defaults before each test
        const { useUpdateType } = jest.requireMock('~/client/common/UpdateTypeContext');
        useUpdateType.mockReturnValue(['consumed', jest.fn()]);
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([]);
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        useUndates.mockReturnValue([]);
    });

    afterEach(() => jest.clearAllMocks());

    function renderTab(active = activeData) {
        return render(
            <MockThemeActive active={{ action: 'history', data: active }}>
                <SummaryHistoryTab />
            </MockThemeActive>
        );
    }

    it('shows empty table when history is empty', () => {
        renderTab();

        expect(screen.getByRole('table')).toBeInTheDocument();
        // only thead row
        expect(screen.getAllByRole('row')).toHaveLength(1);
    });

    it('calls useGetSummaryHistory with year, group, name from active context', () => {
        const { useGetSummaryHistory } = jest.requireMock('~/client/state/history/useGetSummaryHistory');

        renderTab();

        expect(useGetSummaryHistory).toHaveBeenCalledWith(2026, 'Vaisiai', 'Obuoliai');
    });

    it('renders a row for each update entry', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        const entries: History[] = [
            { group: 'Vaisiai', name: 'Obuoliai', time: 1000, year: 2026, amounts: [{ variant: 'p', amount: 1 }] },
            { group: 'Vaisiai', name: 'Obuoliai', time: 2000, year: 2026, amounts: [{ variant: 'd', amount: 2 }] },
        ];
        useUpdates.mockReturnValue(entries);

        renderTab();

        // thead row + 2 data rows
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('renders amounts for each update row', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [
                    { variant: 'p', amount: 2 },
                    { variant: 'd', amount: -1 },
                ],
            },
        ]);

        renderTab();

        expect(screen.getByTestId('amounts')).toHaveTextContent('2');
    });

    it('filters out recycled amounts when updateType is consumed', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [
                    { variant: 'p', amount: 1, recycled: false },
                    { variant: 'r', amount: 2, recycled: true },
                ],
            },
        ]);

        renderTab();

        // Only the non-recycled amount passes; AmountsCell receives 1 amount
        expect(screen.getByTestId('amounts')).toHaveTextContent('1');
    });

    it('filters out non-recycled amounts when updateType is recycled', () => {
        const { useUpdateType } = jest.requireMock('~/client/common/UpdateTypeContext');
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdateType.mockReturnValue(['recycled', jest.fn()]);
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [
                    { variant: 'p', amount: 1, recycled: false },
                    { variant: 'r', amount: 2, recycled: true },
                ],
            },
        ]);

        renderTab();

        // Only the recycled amount passes; AmountsCell receives 1 amount
        expect(screen.getByTestId('amounts')).toHaveTextContent('1');
    });

    it('hides entries whose amounts are entirely filtered out', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        // Entry only has recycled amounts, but updateType is 'consumed' → nothing passes
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [{ variant: 'r', amount: 2, recycled: true }],
            },
        ]);

        renderTab();

        // No data rows rendered
        expect(screen.getAllByRole('row')).toHaveLength(1);
        expect(screen.queryByTestId('amounts')).not.toBeInTheDocument();
    });

    it('renders undate rows with dimmed opacity (before update rows)', () => {
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        const undate: History = {
            group: 'Vaisiai',
            name: 'Obuoliai',
            time: 500,
            year: 2025,
            amounts: [{ variant: 'p', amount: 1 }],
        };
        const update: History = {
            group: 'Vaisiai',
            name: 'Obuoliai',
            time: 1000,
            year: 2026,
            amounts: [{ variant: 'p', amount: 3 }],
        };
        useUndates.mockReturnValue([undate]);
        useUpdates.mockReturnValue([update]);

        renderTab();

        const rows = screen.getAllByRole('row');

        // thead + undate row + divider row + update row = 4
        expect(rows).toHaveLength(4);

        // The undate row has reduced opacity via the dimmed prop (rendered as inline style)
        const undateRow = rows[1];

        expect(undateRow).toHaveStyle({ opacity: '0.4' });
    });

    it('shows a divider row when there are undates', () => {
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        useUndates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 500,
                year: 2025,
                amounts: [{ variant: 'p', amount: 1 }],
            },
        ]);

        renderTab();

        // Divider row is an extra Table.Tr with a colSpan cell
        const rows = screen.getAllByRole('row');

        // thead + undate row + divider row = 3
        expect(rows).toHaveLength(3);

        const dividerRow = rows[2];
        const cell = dividerRow.querySelector('td');

        expect(cell).toHaveAttribute('colspan', '2');
    });

    it('does not show a divider when there are no undates', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [{ variant: 'p', amount: 1 }],
            },
        ]);

        renderTab();

        const rows = screen.getAllByRole('row');

        // thead + 1 update row, no divider
        expect(rows).toHaveLength(2);
    });

    it('renders undates in reverse order (most recent first)', () => {
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        const { AmountsCell } = jest.requireMock('~/client/pages/products/AmountsCell');
        const undates: History[] = [
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2025,
                amounts: [{ variant: 'p', amount: 1 }],
            },
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 2000,
                year: 2025,
                amounts: [{ variant: 'p', amount: 2 }],
            },
        ];
        useUndates.mockReturnValue(undates);

        // Track render order via AmountsCell calls
        const renderOrder: number[] = [];
        AmountsCell.mockImplementation(({ amounts }: any) => {
            renderOrder.push(amounts[0].amount);
            return <span data-testid="amounts">{amounts.length}</span>;
        });

        renderTab();

        // Reversed: [time:2000, amount:2] first, then [time:1000, amount:1]
        expect(renderOrder).toStrictEqual([2, 1]);
    });

    it('displays comment text when present in a history entry', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [{ variant: 'p', amount: 1 }],
                comment: 'Test comment text',
            },
        ]);

        renderTab();

        expect(screen.getByText('Test comment text')).toBeInTheDocument();
    });

    it('does not render comment element when comment is absent', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([
            {
                group: 'Vaisiai',
                name: 'Obuoliai',
                time: 1000,
                year: 2026,
                amounts: [{ variant: 'p', amount: 1 }],
            },
        ]);

        renderTab();

        expect(screen.queryByText('Test comment text')).not.toBeInTheDocument();
    });

    it('uses year=0 when active context has no year', () => {
        const { useGetSummaryHistory } = jest.requireMock('~/client/state/history/useGetSummaryHistory');

        render(
            <MockThemeActive
                active={{
                    action: 'history',
                    data: {
                        group: 'G',
                        name: 'N',
                        amounts: [],
                        updateType: 'consumed',
                    } as unknown as SummaryHistoryData,
                }}
            >
                <SummaryHistoryTab />
            </MockThemeActive>
        );

        expect(useGetSummaryHistory).toHaveBeenCalledWith(0, 'G', 'N');
    });
});
