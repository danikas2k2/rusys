import { act, render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';
import { MockThemeActive } from '@tests/MockThemeActive';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { AmountHistoryTab } from '~/features/products/AmountHistoryTab';
import { RecycleRefreshError } from '~/features/products/hooks/RecycleRefreshError';
import { CATALOG_KEYS } from '~/store/catalog';
import { useProducts } from '~/store/products';

const { move, load } = vi.hoisted(() => ({ move: vi.fn(), load: vi.fn() }));
vi.mock(import('~/features/products/hooks/useGetProductHistory'), () => ({
    useGetProductHistory: () => load,
    invalidatePendingProductHistory: vi.fn(),
}));
vi.mock(import('~/features/products/hooks/useMoveConsumedToRecycled'), () => ({
    useMoveConsumedToRecycled: () => move,
}));
vi.mock(import('~/store/products/useProducts'), () => ({ useProducts: vi.fn() }));

describe('<AmountHistoryTab> shared expansion', () => {
    beforeEach(() => {
        move.mockReset();
        load.mockReset().mockResolvedValue(undefined);
        vi.mocked(useProducts).mockReturnValue([
            {
                group: 'G',
                name: 'N',
                history: {
                    22: {
                        undates: [],
                        updates: [
                            {
                                group: 'G',
                                name: 'N',
                                year: 22,
                                time: 1000,
                                amounts: [{ variant: 'Alpha', amount: -2, recycled: false }],
                            },
                            {
                                group: 'G',
                                name: 'N',
                                year: 22,
                                time: 2000,
                                amounts: [{ variant: 'Beta', amount: -3, recycled: false }],
                            },
                        ],
                    },
                },
            },
        ]);
    });

    function renderHistory() {
        return render(
            <MockApp active={{ action: 'values', data: { group: 'G', name: 'N', year: 22 } }}>
                <AmountHistoryTab />
            </MockApp>
        );
    }

    it('opens only one history form across different days and clears the previous draft', async () => {
        renderHistory();
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-1');

        await user.click(screen.getByRole('button', { name: /Beta/ }));

        expect(screen.getAllByRole('textbox', { name: 'Amount' })).toHaveLength(1);
        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByRole('button', { name: /Beta/ })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('0');

        await user.click(screen.getByRole('button', { name: /Alpha/ }));

        expect(within(screen.getByRole('table')).getAllByRole('textbox', { name: 'Amount' })).toHaveLength(1);
        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('0');

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.queryByRole('textbox', { name: 'Amount' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Beta/ }));
        await user.click(screen.getByRole('button', { name: /Beta/ }));

        expect(screen.queryByRole('textbox', { name: 'Amount' })).not.toBeInTheDocument();
    });

    it.each(['success', 'failure'])('prevents switching days while saving: %s', async (outcome) => {
        let resolve!: () => void;
        let reject!: (error: Error) => void;
        move.mockReturnValue(
            new Promise<void>((res, rej) => {
                resolve = res;
                reject = rej;
            })
        );
        renderHistory();
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));

        expect(screen.getByRole('button', { name: /Beta/ })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute('aria-expanded', 'true');

        await act(async () => {
            if (outcome === 'failure') {
                reject(new Error('failed'));
            } else {
                resolve();
            }
        });

        expect(screen.getByRole('button', { name: /Beta/ })).toBeEnabled();

        expect(screen.queryByRole('alert') !== null).toBe(outcome === 'failure');
        expect(screen.queryByRole('textbox', { name: 'Amount' }) !== null).toBe(outcome === 'failure');
    });

    it('prevents another transfer and reports a committed change when refresh fails', async () => {
        move.mockRejectedValueOnce(new RecycleRefreshError());
        renderHistory();
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
            'Recycled, but refresh failed. Reload the page.'
        );
        expect(screen.getByRole('alert')).toHaveFocus();
        expect(screen.queryByRole('textbox', { name: 'Amount' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Beta/ })).not.toBeInTheDocument();
    });

    it('reports a committed change if the history refresh fails', async () => {
        move.mockResolvedValueOnce(undefined);
        load.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('history failed'));
        renderHistory();
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
            'Recycled, but refresh failed. Reload the page.'
        );
        expect(screen.getByRole('alert')).toHaveFocus();
        expect(screen.queryByRole('button', { name: /Beta/ })).not.toBeInTheDocument();
    });

    it('keeps the refresh warning when the source row disappears before the refresh fails', async () => {
        let reject!: (error: Error) => void;
        move.mockResolvedValueOnce(undefined);
        load.mockResolvedValueOnce(undefined).mockReturnValueOnce(
            new Promise<void>((_, rej) => {
                reject = rej;
            })
        );
        const view = renderHistory();
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));
        vi.mocked(useProducts).mockReturnValue([
            { group: 'G', name: 'N', history: { 22: { updates: [], undates: [] } } },
        ]);
        view.rerender(
            <MockApp active={{ action: 'values', data: { group: 'G', name: 'N', year: 22 } }}>
                <AmountHistoryTab />
            </MockApp>
        );
        await act(async () => {
            reject(new Error('history failed'));
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Recycled, but refresh failed. Reload the page.');
        expect(screen.getByRole('alert')).toHaveFocus();
    });

    it('removes stale history before the tab is reopened after refresh failure', async () => {
        const client = new QueryClient();
        const products = vi.mocked(useProducts)();
        client.setQueryData(CATALOG_KEYS.products, [...products, { group: 'Other', name: 'Product' }]);
        move.mockRejectedValueOnce(new RecycleRefreshError());
        const renderTab = () => (
            <QueryClientProvider client={client}>
                <MockThemeActive active={{ action: 'values', data: { group: 'G', name: 'N', year: 22 } }}>
                    <AmountHistoryTab />
                </MockThemeActive>
            </QueryClientProvider>
        );
        const view = render(renderTab());
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));
        await screen.findByRole('alert');
        const cached = client.getQueryData<typeof products>(CATALOG_KEYS.products)!;

        expect(cached[0].history?.[22]).toBeUndefined();
        expect(cached[1]).toStrictEqual({ group: 'Other', name: 'Product' });

        view.unmount();
        vi.mocked(useProducts).mockReturnValue(cached);
        render(renderTab());

        expect(screen.queryByRole('button', { name: /Alpha/ })).not.toBeInTheDocument();
    });

    it('handles refresh failure when the catalog no longer contains product history', async () => {
        const client = new QueryClient();
        client.setQueryData(CATALOG_KEYS.products, [{ group: 'G', name: 'N' }]);
        move.mockRejectedValueOnce(new RecycleRefreshError());
        render(
            <QueryClientProvider client={client}>
                <MockThemeActive active={{ action: 'values', data: { group: 'G', name: 'N', year: 22 } }}>
                    <AmountHistoryTab />
                </MockThemeActive>
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('button', { name: /Alpha/ }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Recycle' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Recycled, but refresh failed');
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([{ group: 'G', name: 'N' }]);
    });
});
