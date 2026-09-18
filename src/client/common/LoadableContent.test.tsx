import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { LoadableContent } from '~/client/common/LoadableContent';
import { RefreshProvider, useRefreshAll } from '~/client/common/RefreshContext';

describe('<LoadableContent>', () => {
    afterEach(() => vi.restoreAllMocks());

    async function renderContent({
        loader = vi.fn().mockResolvedValue(undefined),
        hasData = false,
    }: {
        loader?: () => Promise<void>;
        hasData?: boolean;
    } = {}) {
        let view!: ReturnType<typeof render>;
        await act(async () => {
            view = render(
                <MockTheme>
                    <RefreshProvider>
                        <LoadableContent resourceKey="test" loader={loader} hasData={hasData}>
                            <main>Content</main>
                        </LoadableContent>
                    </RefreshProvider>
                </MockTheme>
            );
            await Promise.resolve();
        });
        return view;
    }

    it('displays an empty-data error once the resource resolves', async () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        await renderContent({ loader });

        await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByText('No data')).toBeInTheDocument());

        expect(screen.queryByRole('main')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays content once the resource resolves with data', async () => {
        await renderContent({ hasData: true });

        await waitFor(() => expect(screen.getByRole('main')).toBeInTheDocument());

        expect(screen.queryByText('No data')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('uses its ErrorBoundary when the resource rejects', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const loader = vi.fn().mockRejectedValueOnce(new Error('network error')).mockResolvedValueOnce(undefined);
        await renderContent({ loader, hasData: true });

        await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByText('Unexpected error occurred')).toBeInTheDocument());

        expect(screen.queryByRole('main')).not.toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Reload page' }));
            await Promise.resolve();
        });

        await waitFor(() => expect(screen.getByRole('main')).toBeInTheDocument());

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('refreshes its resource through pull-to-refresh without a remount', async () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        let refreshAll: (() => Promise<void>) | undefined;

        function Trigger({ onReady }: { onReady: (fn: () => Promise<void>) => void }) {
            onReady(useRefreshAll());
            return null;
        }

        await act(async () => {
            render(
                <MockTheme>
                    <RefreshProvider>
                        <LoadableContent resourceKey="test" loader={loader} hasData>
                            <main>Content</main>
                        </LoadableContent>
                        <Trigger onReady={(fn) => (refreshAll = fn)} />
                    </RefreshProvider>
                </MockTheme>
            );
            await Promise.resolve();
        });

        await waitFor(() => expect(screen.getByRole('main')).toBeInTheDocument());

        expect(loader).toHaveBeenCalledTimes(1);

        await act(() => refreshAll!());

        expect(loader).toHaveBeenCalledTimes(2);
    });
});
