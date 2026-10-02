import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import type { History, Summary } from '~/common/data';
import { AmountsCell } from '~/components/amounts/AmountsCell';
import { useGetSummaryHistory } from '~/features/summary/hooks/useGetSummaryHistory';
import type { SummaryHistoryData } from '~/features/summary/SummaryAmounts';
import { SummaryHistoryTab } from '~/features/summary/SummaryHistoryTab';
import { useSummary } from '~/store/summary';

vi.mock(import('~/features/summary/hooks/useGetSummaryHistory'), (): any => ({
    useGetSummaryHistory: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/store/summary/useSummary'), (): any => ({
    useSummary: vi.fn(() => []),
}));

vi.mock(import('~/components/common/EmailAvatar'), (): any => ({
    EmailAvatar: vi.fn(() => null),
}));

vi.mock(import('~/components/amounts/AmountsCell'), (): any => ({
    AmountsCell: vi.fn(({ amounts }: any) => <span aria-label="Amount count">{amounts.length}</span>),
}));

describe('<SummaryHistoryTab>', () => {
    const activeData: SummaryHistoryData = {
        group: 'Vaisiai',
        name: 'Obuoliai',
        year: 2026,
        amounts: [],
    };

    function setHistory(updates: readonly History[] = [], undates: readonly History[] = [], year = activeData.year) {
        vi.mocked(useSummary).mockReturnValue([
            { group: activeData.group, name: activeData.name, history: { [year]: { updates, undates } } },
        ]);
    }

    beforeEach(() => setHistory());

    afterEach(() => vi.clearAllMocks());

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
        renderTab();

        expect(vi.mocked(useGetSummaryHistory)).toHaveBeenCalledWith(2026, 'Vaisiai', 'Obuoliai');
    });

    it('loads the selected summary year in the background', () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetSummaryHistory).mockReturnValue(loader);

        renderTab();

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('refreshes cached history after summary data changes', () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetSummaryHistory).mockReturnValue(loader);
        const cached = { updates: [], undates: [] };
        vi.mocked(useSummary).mockReturnValue([
            { group: activeData.group, name: activeData.name, years: [], history: { 2026: cached } },
        ]);

        const { rerender } = renderTab();
        vi.mocked(useSummary).mockReturnValue([
            {
                group: activeData.group,
                name: activeData.name,
                years: [{ year: activeData.year, amounts: [] }],
                history: { 2026: cached },
            },
        ]);
        rerender(
            <MockThemeActive active={{ action: 'history', data: activeData }}>
                <SummaryHistoryTab />
            </MockThemeActive>
        );

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('shows a loader only when that summary year has not been loaded', () => {
        vi.mocked(useSummary).mockReturnValue([{ group: activeData.group, name: activeData.name }]);

        renderTab();

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
    });

    it('uses the cached history for the selected year', () => {
        const history2025: History = {
            group: activeData.group,
            name: activeData.name,
            time: 1000,
            year: 2025,
            amounts: [],
            comment: 'history 2025',
        };
        const history2026: History = {
            group: activeData.group,
            name: activeData.name,
            time: 2000,
            year: 2026,
            amounts: [],
            comment: 'history 2026',
        };
        const summary: Summary = {
            group: activeData.group,
            name: activeData.name,
            history: {
                2025: { updates: [history2025], undates: [] },
                2026: { updates: [history2026], undates: [] },
            },
        };
        vi.mocked(useSummary).mockReturnValue([summary]);

        const { rerender } = renderTab();

        expect(screen.getByText('history 2026')).toBeInTheDocument();

        rerender(
            <MockThemeActive active={{ action: 'history', data: { ...activeData, year: 2025 } }}>
                <SummaryHistoryTab />
            </MockThemeActive>
        );

        expect(screen.getByText('history 2025')).toBeInTheDocument();
        expect(screen.queryByText('history 2026')).not.toBeInTheDocument();
    });

    it('renders a row for each update entry', () => {
        const entries: History[] = [
            { group: 'Vaisiai', name: 'Obuoliai', time: 1000, year: 2026, amounts: [{ variant: 'p', amount: 1 }] },
            { group: 'Vaisiai', name: 'Obuoliai', time: 2000, year: 2026, amounts: [{ variant: 'd', amount: 2 }] },
        ];
        setHistory(entries);

        renderTab();

        // thead row + 2 data rows
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('treats a missing amounts field as empty instead of crashing', () => {
        setHistory([{ group: 'Vaisiai', name: 'Obuoliai', time: 1000, year: 2026 }]);

        renderTab();

        expect(screen.getByLabelText('Amount count')).toHaveTextContent('0');
    });

    it('renders amounts for each update row', () => {
        setHistory([
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

        expect(screen.getByLabelText('Amount count')).toHaveTextContent('2');
    });

    it('renders all amounts regardless of recycled flag', () => {
        setHistory([
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

        // Both amounts passed through — AmountsCell receives 2 amounts
        expect(screen.getByLabelText('Amount count')).toHaveTextContent('2');
    });

    it('renders undate rows with dimmed opacity (before update rows)', () => {
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
        setHistory([update], [undate]);

        renderTab();

        const rows = screen.getAllByRole('row');

        // thead + undate row + divider row + update row = 4
        expect(rows).toHaveLength(4);

        // The undate row has reduced opacity via the dimmed prop (rendered as inline style)
        const undateRow = rows[1];

        expect(undateRow).toHaveStyle({ opacity: '0.4' });
    });

    it('shows a divider row when there are undates', () => {
        setHistory(
            [],
            [
                {
                    group: 'Vaisiai',
                    name: 'Obuoliai',
                    time: 500,
                    year: 2025,
                    amounts: [{ variant: 'p', amount: 1 }],
                },
            ]
        );

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
        setHistory([
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
        setHistory([], undates);

        // Track render order via AmountsCell calls
        const renderOrder: number[] = [];
        vi.mocked(AmountsCell).mockImplementation(({ amounts }: any) => {
            renderOrder.push(amounts[0].amount);
            return <span aria-label="Amount count">{amounts.length}</span>;
        });

        renderTab();

        // Reversed: [time:2000, amount:2] first, then [time:1000, amount:1]
        expect(renderOrder).toStrictEqual([2, 1]);
    });

    it('displays comment text when present in a history entry', () => {
        setHistory([
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
        setHistory([
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

    it('uses empty group/name and year=0 when there is no active content', () => {
        render(
            <MockThemeActive active={undefined}>
                <SummaryHistoryTab />
            </MockThemeActive>
        );

        expect(vi.mocked(useGetSummaryHistory)).toHaveBeenCalledWith(0, '', '');
    });

    it('uses year=0 when active context has no year', () => {
        render(
            <MockThemeActive
                active={{
                    action: 'history',
                    data: {
                        group: 'G',
                        name: 'N',
                        amounts: [],
                    } as unknown as SummaryHistoryData,
                }}
            >
                <SummaryHistoryTab />
            </MockThemeActive>
        );

        expect(vi.mocked(useGetSummaryHistory)).toHaveBeenCalledWith(0, 'G', 'N');
    });
});
