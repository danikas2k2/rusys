import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ValueHistoryTab } from '~/client/pages/products/ValueHistoryTab';
import type { History, ProductAmounts } from '~/types/data';

jest.mock('~/client/state/history/useGetProductHistory', () => ({
    useGetProductHistory: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
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

jest.mock('~/client/pages/products/EmailAvatar', () => ({
    EmailAvatar: jest.fn(() => null),
}));

jest.mock('~/client/pages/products/AmountsCell', () => ({
    AmountsCell: jest.fn(({ amounts }: any) => <span data-testid="amounts">{amounts.length}</span>),
}));

describe('<ValueHistoryTab>', () => {
    const activeData: ProductAmounts = { group: 'Uogienės', name: 'Avietės', year: 2026 };

    afterEach(() => jest.clearAllMocks());

    function renderTab(active = activeData) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <ValueHistoryTab />
            </MockThemeActive>
        );
    }

    it('shows empty table when history is empty', () => {
        renderTab();

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryAllByRole('row')).toHaveLength(1); // only thead
    });

    it('calls useGetProductHistory with year, group, name from active context', () => {
        const { useGetProductHistory: useGetHistory } = jest.requireMock('~/client/state/history/useGetProductHistory');

        renderTab();

        expect(useGetHistory).toHaveBeenCalledWith(2026, 'Uogienės', 'Avietės');
    });

    it('renders a row for each history entry', () => {
        const { useUpdates: useHistory } = jest.requireMock('~/client/state/history/useUpdates');
        const entries: History[] = [
            { group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [{ variant: 'p', amount: 1 }] },
            { group: 'Uogienės', name: 'Avietės', time: 2000, year: 2026, amounts: [{ variant: 'd', amount: -1 }] },
        ];
        useHistory.mockReturnValue(entries);

        renderTab();

        expect(screen.getAllByRole('row')).toHaveLength(entries.length + 1); // +1 for thead
    });

    it('renders amounts for each row', () => {
        const { useUpdates: useHistory } = jest.requireMock('~/client/state/history/useUpdates');
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

        expect(screen.getByTestId('amounts')).toHaveTextContent('2');
    });

    it('uses year=0 when active context has no year', () => {
        const { useGetProductHistory: useGetHistory } = jest.requireMock('~/client/state/history/useGetProductHistory');

        render(
            <MockThemeActive active={{ action: 'values', data: { group: 'G', name: 'N' } as ProductAmounts }}>
                <ValueHistoryTab />
            </MockThemeActive>
        );

        expect(useGetHistory).toHaveBeenCalledWith(0, 'G', 'N');
    });

    it('renders undates rows reversed before the divider', () => {
        jest.requireMock('~/client/state/history/useUpdates').useUpdates.mockReturnValue([]);
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        const undates: History[] = [
            { group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] },
            { group: 'Uogienės', name: 'Avietės', time: 200, year: 2026, amounts: [] },
        ];
        useUndates.mockReturnValue(undates);

        renderTab();

        // thead row + 2 undate rows + 1 divider row = 4
        expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('renders a divider row when undates are present', () => {
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        useUndates.mockReturnValue([{ group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] }]);

        renderTab();

        // The divider is rendered inside a Table.Tr — Divider has role "separator"
        expect(document.querySelector('[data-table="history"] hr, [role="separator"]')).not.toBeNull();
    });

    it('does not render a divider row when undates are empty', () => {
        jest.requireMock('~/client/state/history/useUndates').useUndates.mockReturnValue([]);

        renderTab();

        expect(document.querySelector('[role="separator"]')).toBeNull();
    });

    it('shows comment text when h.comment is set', () => {
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([
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
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([{ group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [] }]);

        renderTab();

        // No comment text should appear
        expect(screen.queryByText(/batch/i)).not.toBeInTheDocument();
    });

    it('dimmed (undate) rows have opacity 0.4', () => {
        const { useUndates } = jest.requireMock('~/client/state/history/useUndates');
        useUndates.mockReturnValue([{ group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] }]);

        renderTab();

        // The first tbody row is the undate row — check its style
        const tbodyRows = document.querySelectorAll('[data-table="history"] tbody tr');

        // first row = undate (dimmed), second = divider
        expect((tbodyRows[0] as HTMLElement).style.opacity).toBe('0.4');
    });

    it('non-dimmed (update) rows do not have opacity set', () => {
        jest.requireMock('~/client/state/history/useUndates').useUndates.mockReturnValue([]);
        const { useUpdates } = jest.requireMock('~/client/state/history/useUpdates');
        useUpdates.mockReturnValue([{ group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [] }]);

        renderTab();

        const tbodyRows = document.querySelectorAll('[data-table="history"] tbody tr');

        expect((tbodyRows[0] as HTMLElement).style.opacity).toBe('');
    });
});
