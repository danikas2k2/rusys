'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration(): null {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
            void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        }
    }, []);

    return null;
}

export async function refreshOfflinePage(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    try {
        if (await navigator.serviceWorker.getRegistration()) {
            (await navigator.serviceWorker.ready).active?.postMessage({ type: 'REFRESH_OFFLINE_PAGE' });
        }
    } catch {
        // The saved page will be updated when the service worker is installed again.
    }
}

export async function clearOfflineData(): Promise<void> {
    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.active) {
                await new Promise<void>((resolve) => {
                    const channel = new MessageChannel();
                    const timeout = window.setTimeout(resolve, 3000);
                    channel.port1.onmessage = () => {
                        window.clearTimeout(timeout);
                        resolve();
                    };
                    registration.active?.postMessage({ type: 'CLEAR_USER' }, [channel.port2]);
                });
            }
        }
    } catch {
        // Continue clearing browser storage even if the worker is unavailable.
    }
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((key) => key.startsWith('rusys-private-') || key.startsWith('rusys-session-'))
                    .map((key) => caches.delete(key))
            );
        }
    } catch {
        // Let server-side logout continue if browser storage is unavailable.
    }
}
