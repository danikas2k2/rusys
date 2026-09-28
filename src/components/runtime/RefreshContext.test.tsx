import { act, render } from '@testing-library/react';

import React from 'react';

import { RefreshProvider, useRefreshAll, useRegisterRefresh } from '~/components/runtime/RefreshContext';

function Registrar({ fn }: { fn: () => Promise<unknown> }) {
    useRegisterRefresh(fn);
    return null;
}

function Trigger({ onReady }: { onReady: (refreshAll: () => Promise<void>) => void }) {
    const refreshAll = useRefreshAll();
    onReady(refreshAll);
    return null;
}

describe('refreshContext', () => {
    it('resolves without error when useRefreshAll is called outside a RefreshProvider', async () => {
        let refreshAll: (() => Promise<void>) | undefined;
        render(<Trigger onReady={(fn) => (refreshAll = fn)} />);

        await expect(refreshAll!()).resolves.toBeUndefined();
    });

    it('does not throw when useRegisterRefresh is called outside a RefreshProvider', () => {
        const fn = vi.fn().mockResolvedValue(undefined);

        expect(() => render(<Registrar fn={fn} />)).not.toThrow();
    });

    it('calls a single registered refresh function', async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        let refreshAll: (() => Promise<void>) | undefined;

        render(
            <RefreshProvider>
                <Registrar fn={fn} />
                <Trigger onReady={(f) => (refreshAll = f)} />
            </RefreshProvider>
        );

        await act(() => refreshAll!());

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('calls every registered refresh function', async () => {
        const fn1 = vi.fn().mockResolvedValue(undefined);
        const fn2 = vi.fn().mockResolvedValue(undefined);
        let refreshAll: (() => Promise<void>) | undefined;

        render(
            <RefreshProvider>
                <Registrar fn={fn1} />
                <Registrar fn={fn2} />
                <Trigger onReady={(f) => (refreshAll = f)} />
            </RefreshProvider>
        );

        await act(() => refreshAll!());

        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('no longer calls a refresh function once its owner has unmounted', async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        let refreshAll: (() => Promise<void>) | undefined;

        const { rerender } = render(
            <RefreshProvider>
                <Registrar fn={fn} />
                <Trigger onReady={(f) => (refreshAll = f)} />
            </RefreshProvider>
        );

        rerender(
            <RefreshProvider>
                <Trigger onReady={(f) => (refreshAll = f)} />
            </RefreshProvider>
        );

        await act(() => refreshAll!());

        expect(fn).not.toHaveBeenCalled();
    });

    it('waits for all registered refresh functions to settle', async () => {
        let resolveSlow: () => void;
        const slow = vi.fn().mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveSlow = resolve;
                })
        );
        const fast = vi.fn().mockResolvedValue(undefined);
        let refreshAll: (() => Promise<void>) | undefined;

        render(
            <RefreshProvider>
                <Registrar fn={slow} />
                <Registrar fn={fast} />
                <Trigger onReady={(f) => (refreshAll = f)} />
            </RefreshProvider>
        );

        let settled = false;
        const promise = refreshAll!().then(() => {
            settled = true;
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(settled).toBe(false);

        await act(async () => {
            resolveSlow();
            await promise;
        });

        expect(settled).toBe(true);
    });
});
