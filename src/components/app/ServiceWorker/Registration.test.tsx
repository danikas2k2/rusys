import { render, waitFor } from '@testing-library/react';

import React from 'react';

import { clearOfflineData, refreshOfflinePage, ServiceWorkerRegistration } from './Registration';

describe('service worker registration and cleanup', () => {
    const postMessage = vi.fn();
    const register = vi.fn().mockResolvedValue(undefined);
    const getRegistration = vi.fn().mockResolvedValue({ active: { postMessage } });
    const cacheKeys = vi.fn().mockResolvedValue(['rusys-private-v1-a', 'rusys-session-v1', 'other']);
    const cacheDelete = vi.fn().mockResolvedValue(true);

    beforeEach(() => {
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: { register, getRegistration, ready: Promise.resolve({ active: { postMessage } }) },
        });
        Object.defineProperty(window, 'caches', {
            configurable: true,
            value: { keys: cacheKeys, delete: cacheDelete },
        });
    });

    afterEach(() => {
        Reflect.deleteProperty(navigator, 'serviceWorker');
        Reflect.deleteProperty(window, 'caches');
        vi.unstubAllEnvs();
        vi.clearAllMocks();
        getRegistration.mockResolvedValue({ active: { postMessage } });
        cacheKeys.mockResolvedValue(['rusys-private-v1-a', 'rusys-session-v1', 'other']);
    });

    it('registers only in production with service worker support', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        render(<ServiceWorkerRegistration />);
        await waitFor(() =>
            expect(register).toHaveBeenCalledExactlyOnceWith('/sw.js', { scope: '/', updateViaCache: 'none' })
        );
    });

    it('skips registration outside production or without support', () => {
        vi.stubEnv('NODE_ENV', 'test');
        render(<ServiceWorkerRegistration />);
        Reflect.deleteProperty(navigator, 'serviceWorker');
        vi.stubEnv('NODE_ENV', 'production');
        render(<ServiceWorkerRegistration />);

        expect(register).not.toHaveBeenCalled();
    });

    it('asks an installed worker to refresh the translated offline page', async () => {
        await refreshOfflinePage();

        expect(postMessage).toHaveBeenCalledExactlyOnceWith({ type: 'REFRESH_OFFLINE_PAGE' });
    });

    it('ignores an absent or failed worker while refreshing', async () => {
        getRegistration.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('offline'));
        await refreshOfflinePage();
        await refreshOfflinePage();
        Reflect.deleteProperty(navigator, 'serviceWorker');
        await refreshOfflinePage();

        expect(postMessage).not.toHaveBeenCalled();
    });

    it('waits for worker acknowledgment and deletes only account caches on sign-out', async () => {
        const originalChannel = globalThis.MessageChannel;
        const ports = [{ onmessage: null as null | (() => void) }, {}];
        vi.stubGlobal(
            'MessageChannel',
            class {
                port1 = ports[0];
                port2 = ports[1];
            }
        );
        postMessage.mockImplementationOnce(() => ports[0].onmessage?.());

        try {
            await clearOfflineData();

            expect(postMessage).toHaveBeenCalledWith({ type: 'CLEAR_USER' }, [ports[1]]);
            expect(cacheDelete).toHaveBeenCalledTimes(2);
            expect(cacheDelete).toHaveBeenCalledWith('rusys-private-v1-a');
            expect(cacheDelete).toHaveBeenCalledWith('rusys-session-v1');
            expect(cacheDelete).not.toHaveBeenCalledWith('other');
        } finally {
            vi.stubGlobal('MessageChannel', originalChannel);
        }
    });

    it('clears account caches even if worker access fails', async () => {
        getRegistration.mockRejectedValueOnce(new Error('worker unavailable'));
        await clearOfflineData();

        expect(cacheDelete).toHaveBeenCalledTimes(2);
    });

    it('ignores a failed cache cleanup', async () => {
        getRegistration.mockResolvedValueOnce(undefined);
        cacheKeys.mockRejectedValueOnce(new Error('storage unavailable'));

        await expect(clearOfflineData()).resolves.toBeUndefined();
    });
});
