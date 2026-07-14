import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ValueHistoryTab } from '~/client/pages/products/ValueHistoryTab';
import type { History, ProductAmounts } from '~/types/data';

jest.mock('~/client/state/history/useGetHistory', () => ({
    useGetHistory: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
}));

jest.mock('~/client/hooks/useLockingLoader', () => ({
    useLockingLoader: jest.fn(() => 'complete'),
    LoadingState: { INITIAL: 'initial', LOADING: 'loading', COMPLETE: 'complete', FAILED: 'failed' },
}));

jest.mock('~/client/state/history/useHistory', () => ({
    useHistory: jest.fn(() => []),
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

    it('calls useGetHistory with year, group, name from active context', () => {
        const { useGetHistory } = jest.requireMock('~/client/state/history/useGetHistory');

        renderTab();

        expect(useGetHistory).toHaveBeenCalledWith(2026, 'Uogienės', 'Avietės');
    });

    it('renders a row for each history entry', () => {
        const { useHistory } = jest.requireMock('~/client/state/history/useHistory');
        const entries: History[] = [
            { group: 'Uogienės', name: 'Avietės', time: 1000, year: 2026, amounts: [{ variant: 'p', amount: 1 }] },
            { group: 'Uogienės', name: 'Avietės', time: 2000, year: 2026, amounts: [{ variant: 'd', amount: -1 }] },
        ];
        useHistory.mockReturnValue(entries);

        renderTab();

        expect(screen.getAllByRole('row')).toHaveLength(entries.length + 1); // +1 for thead
    });

    it('renders amounts for each row', () => {
        const { useHistory } = jest.requireMock('~/client/state/history/useHistory');
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
        const { useGetHistory } = jest.requireMock('~/client/state/history/useGetHistory');

        render(
            <MockThemeActive active={{ action: 'values', data: { group: 'G', name: 'N' } as ProductAmounts }}>
                <ValueHistoryTab />
            </MockThemeActive>
        );

        expect(useGetHistory).toHaveBeenCalledWith(0, 'G', 'N');
    });
});
