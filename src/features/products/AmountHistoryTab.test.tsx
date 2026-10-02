import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import type { History, Product, ProductAmounts } from '~/common/data';
import { AmountHistoryTab } from '~/features/products/AmountHistoryTab';
import { useGetProductHistory } from '~/features/products/hooks/useGetProductHistory';
import { useProducts } from '~/store/products/useProducts';

vi.mock(import('~/features/products/hooks/useGetProductHistory'), (): any => ({
    useGetProductHistory: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/features/products/hooks/useMoveConsumedToRecycled'), (): any => ({
    useMoveConsumedToRecycled: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

vi.mock(import('~/store/products/useProducts'), (): any => ({
    useProducts: vi.fn(() => []),
}));

vi.mock(import('~/components/common/EmailAvatar'), (): any => ({
    EmailAvatar: vi.fn(() => null),
}));

vi.mock(import('~/components/amounts/AmountsCell'), (): any => ({
    AmountsCell: vi.fn(({ amounts }: any) => <span aria-label="Amount count">{amounts.length}</span>),
}));

describe('<AmountHistoryTab>', () => {
    const activeData: ProductAmounts = { group: 'Uogienės', name: 'Avietės', year: 2026 };

    function setHistory(updates: readonly History[] = [], undates: readonly History[] = [], year = activeData.year) {
        vi.mocked(useProducts).mockReturnValue([
            { group: activeData.group, name: activeData.name, history: { [year]: { updates, undates } } },
        ]);
    }

    function renderTab(active = activeData) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }}>
                <AmountHistoryTab />
            </MockThemeActive>
        );
    }

    beforeEach(() => setHistory());

    afterEach(() => vi.clearAllMocks());

    it('shows cached empty history immediately', () => {
        renderTab();

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryAllByRole('row')).toHaveLength(1); // only thead
    });

    it('shows an empty history table when no product is active', () => {
        render(
            <MockThemeActive active={undefined}>
                <AmountHistoryTab />
            </MockThemeActive>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryAllByRole('row')).toHaveLength(1);
    });

    it('loads the active product year in the background', () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetProductHistory).mockReturnValue(loader);

        renderTab();

        expect(useGetProductHistory).toHaveBeenCalledWith(2026, 'Uogienės', 'Avietės');
        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('refreshes cached history after the product history metadata changes', () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetProductHistory).mockReturnValue(loader);
        const cached = { updates: [], undates: [] };
        vi.mocked(useProducts).mockReturnValue([
            { group: activeData.group, name: activeData.name, updates: [], history: { 2026: cached } },
        ]);

        const { rerender } = renderTab();
        vi.mocked(useProducts).mockReturnValue([
            {
                group: activeData.group,
                name: activeData.name,
                updates: [{ year: activeData.year }],
                history: { 2026: cached },
            },
        ]);
        rerender(
            <MockThemeActive active={{ action: 'values', data: activeData }}>
                <AmountHistoryTab />
            </MockThemeActive>
        );

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('shows a loader only when that product year has not been loaded', () => {
        vi.mocked(useProducts).mockReturnValue([{ group: activeData.group, name: activeData.name }]);

        renderTab();

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
    });

    it('uses the cached history for the selected year', () => {
        const history2025: History = {
            group: 'Uogienės',
            name: 'Avietės',
            time: 1000,
            year: 2025,
            amounts: [{ variant: '2025', amount: 1 }],
            comment: 'history 2025',
        };
        const history2026: History = {
            group: 'Uogienės',
            name: 'Avietės',
            time: 2000,
            year: 2026,
            amounts: [{ variant: '2026', amount: 1 }],
            comment: 'history 2026',
        };
        const product: Product = {
            group: activeData.group,
            name: activeData.name,
            history: {
                2025: { updates: [history2025], undates: [] },
                2026: { updates: [history2026], undates: [] },
            },
        };
        vi.mocked(useProducts).mockReturnValue([product]);

        const { rerender } = renderTab();

        expect(screen.getByText('history 2026')).toBeInTheDocument();

        rerender(
            <MockThemeActive active={{ action: 'values', data: { ...activeData, year: 2025 } }}>
                <AmountHistoryTab />
            </MockThemeActive>
        );

        expect(screen.getByText('history 2025')).toBeInTheDocument();
        expect(screen.queryByText('history 2026')).not.toBeInTheDocument();
    });

    it('renders undates rows reversed before the divider', () => {
        const undates: History[] = [
            { group: 'Uogienės', name: 'Avietės', time: 100, year: 2026, amounts: [] },
            { group: 'Uogienės', name: 'Avietės', time: 200, year: 2026, amounts: [] },
        ];
        setHistory([], undates);

        renderTab();

        expect(screen.getAllByRole('row')).toHaveLength(4); // thead + 2 undates + divider
    });

    it('renders amounts and comments from the product-year cache', () => {
        setHistory([
            {
                group: 'Uogienės',
                name: 'Avietės',
                time: 1000,
                year: 2026,
                amounts: [{ variant: 'p', amount: 2 }],
                comment: 'Special batch',
            },
        ]);

        renderTab();

        expect(screen.getByLabelText('Amount count')).toHaveTextContent('1');
        expect(screen.getByText('Special batch')).toBeInTheDocument();
    });
});
