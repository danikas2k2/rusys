import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import type { History, ProductAmounts } from '@rusys/common/data';
import React from 'react';

import { AmountHistoryTab } from '~/client/pages/products/AmountHistoryTab';
import { useGetProductHistory } from '~/client/state/history/useGetProductHistory';
import { useUndates } from '~/client/state/history/useUndates';
import { useUpdates } from '~/client/state/history/useUpdates';

vi.mock(import('~/client/state/history/useGetProductHistory'), (): any => ({
    useGetProductHistory: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/client/state/products/useMoveConsumedToRecycled'), (): any => ({
    useMoveConsumedToRecycled: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/client/hooks/useLockingLoader'), (): any => ({
    useLockingLoader: vi.fn(() => 'complete'),
    LoadingState: { INITIAL: 'initial', LOADING: 'loading', COMPLETE: 'complete', FAILED: 'failed' },
}));

vi.mock(import('~/client/state/history/useUpdates'), (): any => ({
    useUpdates: vi.fn(() => []),
}));

vi.mock(import('~/client/state/history/useUndates'), (): any => ({
    useUndates: vi.fn(() => []),
}));

vi.mock(import('~/client/common/EmailAvatar'), (): any => ({
    EmailAvatar: vi.fn(() => null),
}));

vi.mock(import('~/client/common/AmountsCell'), (): any => ({
    AmountsCell: vi.fn(({ amounts }: any) => <span aria-label="Amount count">{amounts.length}</span>),
}));

describe('<AmountHistoryTab>', () => {
    const activeData: ProductAmounts = { group: 'Uogienės', name: 'Avietės', year: 2026 };

    afterEach(() => vi.clearAllMocks());

    function renderTab(active = activeData) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountHistoryTab />
            </MockThemeActive>
        );
    }

    it('shows empty table when history is empty', () => {
        renderTab();

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryAllByRole('row')).toHaveLength(1); // only thead
    });

    it('calls useGetProductHistory with year, group, name from active context', () => {
        const useGetHistory = vi.mocked(useGetProductHistory);

        renderTab();

        expect(useGetHistory).toHaveBeenCalledWith(2026, 'Uogienės', 'Avietės');
    });

    it('renders a row for each history entry', () => {
        const useHistory = vi.mocked(useUpdates);
        const entries: History[] = [
            { group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [{ variant: 'p', amount: 1 }] },
            { group: 'Uogienės', name: 'Avietės', time: 2000, year: 2026, amounts: [{ variant: 'd', amount: -1 }] },
        ];
        useHistory.mockReturnValue(entries);

        renderTab();

        expect(screen.getAllByRole('row')).toHaveLength(entries.length + 1); // +1 for thead
    });

    it('renders amounts for each row', () => {
        const useHistory = vi.mocked(useUpdates);
        useHistory.mockReturnValue([
            {
                group: 'Uogienės',
                name: 'Avietės',
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

    it('uses year=0 when active context has no year', () => {
        const useGetHistory = vi.mocked(useGetProductHistory);

        render(
            <MockThemeActive active={{ action: 'values', data: { group: 'G', name: 'N' } as ProductAmounts }}>
                <AmountHistoryTab />
            </MockThemeActive>
        );

        expect(useGetHistory).toHaveBeenCalledWith(0, 'G', 'N');
    });

    it('uses empty group/name and year=0 when there is no active content', () => {
        const useGetHistory = vi.mocked(useGetProductHistory);

        render(
            <MockThemeActive active={undefined}>
                <AmountHistoryTab />
            </MockThemeActive>
        );

        expect(useGetHistory).toHaveBeenCalledWith(0, '', '');
    });

    it('renders undates rows reversed before the divider', () => {
        vi.mocked(useUpdates).mockReturnValue([]);
        const undates: History[] = [
            { group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] },
            { group: 'Uogienės', name: 'Avietės', time: 200, year: 2026, amounts: [] },
        ];
        vi.mocked(useUndates).mockReturnValue(undates);

        renderTab();

        // thead row + 2 undate rows + 1 divider row = 4
        expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('renders a divider row when undates are present', () => {
        vi.mocked(useUndates).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] },
        ]);

        renderTab();

        // The divider is rendered inside a Table.Tr — Divider has role "separator"
        expect(document.querySelector('[data-table="history"] hr, [role="separator"]')).not.toBeNull();
    });

    it('does not render a divider row when undates are empty', () => {
        vi.mocked(useUndates).mockReturnValue([]);

        renderTab();

        expect(document.querySelector('[role="separator"]')).toBeNull();
    });

    it('shows comment text when h.comment is set', () => {
        vi.mocked(useUpdates).mockReturnValue([
            {
                group: 'Uogienės',
                name: 'Avietės',
                time: 1000,
                year: 2026,
                amounts: [],
                comment: 'Special batch',
            },
        ]);

        renderTab();

        expect(screen.getByText('Special batch')).toBeInTheDocument();
    });

    it('does not show comment element when h.comment is absent', () => {
        vi.mocked(useUpdates).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [] },
        ]);

        renderTab();

        // No comment text should appear
        expect(screen.queryByText(/batch/i)).not.toBeInTheDocument();
    });

    it('dimmed (undate) rows have opacity 0.4', () => {
        vi.mocked(useUndates).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] },
        ]);

        renderTab();

        // The first tbody row is the undate row — check its style
        const tbodyRows = document.querySelectorAll('[data-table="history"] tbody tr');

        // first row = undate (dimmed), second = divider
        expect((tbodyRows[0] as HTMLElement).style.opacity).toBe('0.4');
    });

    it('non-dimmed (update) rows do not have opacity set', () => {
        vi.mocked(useUndates).mockReturnValue([]);
        vi.mocked(useUpdates).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [] },
        ]);

        renderTab();

        const tbodyRows = document.querySelectorAll('[data-table="history"] tbody tr');

        expect((tbodyRows[0] as HTMLElement).style.opacity).toBe('');
    });
});
