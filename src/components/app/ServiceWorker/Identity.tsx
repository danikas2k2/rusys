'use client';

import { useEffect } from 'react';

export function ServiceWorkerIdentity({ sub }: { sub?: string }): null {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
            return;
        }
        void navigator.serviceWorker.ready.then((registration) => {
            registration.active?.postMessage(sub ? { type: 'SET_USER', sub } : { type: 'CLEAR_USER' });
        });
    }, [sub]);

    return null;
}
