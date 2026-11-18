import { act, render, screen, waitFor } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { AmountsCell } from '~/components/amounts/AmountsCell';
import { ConsumedHistoryTab } from '~/features/products/ConsumedHistoryTab';
import { useGetConsumedHistory } from '~/features/products/hooks/useGetConsumedHistory';
import type { History, ProductAmounts, Summary } from '~/schema';
import { useSummary } from '~/store/summary';

vi.mock(import('~/features/products/hooks/useGetConsumedHistory'), (): any => ({
    useGetConsumedHistory: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
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

vi.mock(import('~/features/products/hooks/historyCache'), () => ({ useHistoryRevision: vi.fn(() => 0) }));

vi.mock(import('~/store/years'), () => ({ useYears: vi.fn(() => []) }));

describe('<ConsumedHistoryTab>', () => {
    const activeData: ProductAmounts = {
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
                <ConsumedHistoryTab />
            </MockThemeActive>
        );
    }

    it('finishes loading for a product without a summary entry', async () => {
        vi.mocked(useSummary).mockReturnValue([]);
        const loader = vi.fn().mockResolvedValue({ updates: [], undates: [] });
        vi.mocked(useGetConsumedHistory).mockReturnValueOnce(loader);

        const { rerender } = renderTab();
        await waitFor(() => expect(loader).toHaveBeenCalledWith());
        setHistory();
        rerender(
            <MockThemeActive active={{ action: 'history', data: activeData }}>
                <ConsumedHistoryTab />
            </MockThemeActive>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryAllByRole('row')).toHaveLength(0);
    });

    it('shows empty table when history is empty', () => {
        renderTab();

        expect(screen.getByRole('table')).toBeInTheDocument();
        // No entries and no header row
        expect(screen.queryAllByRole('row')).toHaveLength(0);
    });

    it('calls useGetConsumedHistory with year, group, name from active context', () => {
        renderTab();

        expect(vi.mocked(useGetConsumedHistory)).toHaveBeenCalledWith({
            year: 2026,
            group: 'Vaisiai',
            name: 'Obuoliai',
        });
    });

    it('loads the selected summary year in the background', () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetConsumedHistory).mockReturnValue(loader);

        renderTab();

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('refreshes cached history after summary data changes', () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetConsumedHistory).mockReturnValue(loader);
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
                <ConsumedHistoryTab />
            </MockThemeActive>
        );

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('shows a load error when the selected history request fails', async () => {
        const loader = vi.fn().mockRejectedValue(new Error('Network failed'));
        vi.mocked(useGetConsumedHistory).mockReturnValue(loader);
        renderTab();

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Failed to load data');
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('ignores a failed request from a year that is no longer selected', async () => {
        let rejectOld!: (reason: Error) => void;
        const oldLoader = vi.fn(
            () =>
                new Promise<undefined>((_resolve, reject) => {
                    rejectOld = reject;
                })
        );
        const newLoader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetConsumedHistory).mockImplementation(({ year }) =>
            year === activeData.year ? oldLoader : newLoader
        );
        const { rerender } = renderTab();
        setHistory(
            [
                {
                    group: activeData.group,
                    name: activeData.name,
                    time: 1,
                    amounts: [],
                    comment: 'Selected year',
                },
            ],
            [],
            2025
        );
        rerender(
            <MockThemeActive active={{ action: 'history', data: { ...activeData, year: 2025 } }}>
                <ConsumedHistoryTab />
            </MockThemeActive>
        );

        await act(async () => {
            rejectOld(new Error('Late failure'));
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toHaveTextContent('Selected year');
        expect(newLoader).toHaveBeenCalledExactlyOnceWith();
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
                <ConsumedHistoryTab />
            </MockThemeActive>
        );

        expect(screen.getByText('history 2025')).toBeInTheDocument();
        expect(screen.queryByText('history 2026')).not.toBeInTheDocument();
    });

    it('renders a row for each update entry without column headers', () => {
        const entries: History[] = [
            { group: 'Vaisiai', name: 'Obuoliai', time: 1000, year: 2026, amounts: [{ variant: 'p', amount: 1 }] },
            { group: 'Vaisiai', name: 'Obuoliai', time: 2000, year: 2026, amounts: [{ variant: 'd', amount: 2 }] },
        ];
        setHistory(entries);

        renderTab();

        // 2 data rows
        expect(screen.getAllByRole('row')).toHaveLength(2);
        expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
        expect(screen.getByRole('table').querySelector('thead')).toBeNull();
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

        // undate row + divider row + update row = 3
        expect(rows).toHaveLength(3);

        // The undate row has reduced opacity via the dimmed prop (rendered as inline style)
        const undateRow = rows[0];

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

        // undate row + divider row = 2
        expect(rows).toHaveLength(2);

        const dividerRow = rows[1];
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

        // 1 update row, no divider
        expect(rows).toHaveLength(1);
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
                <ConsumedHistoryTab />
            </MockThemeActive>
        );

        expect(vi.mocked(useGetConsumedHistory)).toHaveBeenCalledWith({ year: 0, group: '', name: '' });
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
                    } as unknown as ProductAmounts,
                }}
            >
                <ConsumedHistoryTab />
            </MockThemeActive>
        );

        expect(vi.mocked(useGetConsumedHistory)).toHaveBeenCalledWith({ year: 0, group: 'G', name: 'N' });
    });
});
