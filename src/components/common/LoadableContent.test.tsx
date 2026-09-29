import { act, render, screen, waitFor, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { LoadableContent } from '~/components/common/LoadableContent';
import { RefreshProvider, useRefreshAll } from '~/components/runtime/RefreshContext';

describe('<LoadableContent>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => vi.restoreAllMocks());

    async function renderContent({
        loader = vi.fn().mockResolvedValue(undefined),
        hasData = false,
    }: {
        loader?: () => Promise<void>;
        hasData?: boolean;
    } = {}) {
        let view!: RenderResult;
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

    it('uses server-loaded data on first render and still refreshes it on demand', async () => {
        const loader = vi.fn().mockResolvedValue(undefined);
        let refreshAll: (() => Promise<void>) | undefined;

        function Trigger({ onReady }: { onReady: (refresh: () => Promise<void>) => void }) {
            onReady(useRefreshAll());
            return null;
        }

        render(
            <MockTheme>
                <RefreshProvider initialResource="products">
                    <LoadableContent resourceKey="products" loader={loader} hasData>
                        <main>Content</main>
                    </LoadableContent>
                    <Trigger onReady={(refresh) => (refreshAll = refresh)} />
                </RefreshProvider>
            </MockTheme>
        );

        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(loader).not.toHaveBeenCalled();

        await act(() => refreshAll!());

        expect(loader).toHaveBeenCalledTimes(1);
        expect(loader).toHaveBeenCalledWith(false);
    });

    it('uses its ErrorBoundary when the resource rejects', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const loader = vi.fn().mockRejectedValueOnce(new Error('network error')).mockResolvedValueOnce(undefined);
        await renderContent({ loader, hasData: true });

        await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByText('Unexpected error occurred')).toBeInTheDocument());

        expect(screen.queryByRole('main')).not.toBeInTheDocument();

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'Reload page' }));
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
        expect(loader).toHaveBeenCalledWith(true);

        await act(() => refreshAll!());

        expect(loader).toHaveBeenCalledTimes(2);
    });
});
