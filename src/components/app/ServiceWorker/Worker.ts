/// <reference lib="webworker" />

// This function is serialized by the /sw.js route after Next.js compiles it.
// Keep its runtime dependencies inside the function or in service-worker globals.
export function installServiceWorker(): void {
    const worker = self as unknown as ServiceWorkerGlobalScope;

    const CACHE = 'rusys-public-v2';
    const PRIVATE_PREFIX = 'rusys-private-v1-';
    const SESSION_CACHE = 'rusys-session-v1';
    const SESSION_KEY = `${worker.location.origin}/__offline_user`;
    const IDENTITY_URL = '/api/v1/offline/identity';
    const OFFLINE_URL = '/offline';
    const PRECACHE = [
        OFFLINE_URL,
        '/manifest.json',
        '/assets/logo.svg',
        '/assets/manifest-icon-192.maskable.png',
        '/assets/manifest-icon-512.maskable.png',
    ];

    async function activeUser(): Promise<string | undefined> {
        return (await (await caches.open(SESSION_CACHE)).match(SESSION_KEY))?.text();
    }

    async function clearPrivateData(): Promise<void> {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith(PRIVATE_PREFIX)).map((key) => caches.delete(key)));
        await (await caches.open(SESSION_CACHE)).delete(SESSION_KEY);
    }

    async function currentUserMatches(sub: string): Promise<boolean> {
        const response = await fetch(IDENTITY_URL, { cache: 'no-store', credentials: 'include' });
        return response.ok && (await response.json()).sub === sub;
    }

    function userCache(sub: string): Promise<Cache> {
        return caches.open(`${PRIVATE_PREFIX}${encodeURIComponent(sub)}`);
    }

    worker.addEventListener('message', (event) => {
        const data = event.data as { type?: string; sub?: string } | undefined;
        if (data?.type === 'REFRESH_OFFLINE_PAGE') {
            event.waitUntil(
                (async () => {
                    try {
                        const response = await fetch(OFFLINE_URL, { cache: 'no-store', credentials: 'include' });
                        if (response.ok && response.headers.get('Content-Type')?.includes('text/html')) {
                            await (await caches.open(CACHE)).put(OFFLINE_URL, response);
                        }
                    } catch {
                        // Keep the previously cached page during a network outage.
                    }
                })()
            );
            return;
        }
        if (data?.type !== 'SET_USER' && data?.type !== 'CLEAR_USER') {
            return;
        }
        event.waitUntil(
            (async () => {
                try {
                    if (data.type === 'CLEAR_USER') {
                        await clearPrivateData();
                        return;
                    }
                    if (!data.sub || !(await currentUserMatches(data.sub))) {
                        return;
                    }
                    if ((await activeUser()) !== data.sub) {
                        await clearPrivateData();
                    }
                    await (await caches.open(SESSION_CACHE)).put(SESSION_KEY, new Response(data.sub));

                    const source = event.source;
                    if (!source || !('url' in source)) {
                        return;
                    }
                    const url = new URL(source.url);
                    if (url.origin !== worker.location.origin || url.pathname === '/offline') {
                        return;
                    }
                    const request = new Request(url, { credentials: 'include', headers: { Accept: 'text/html' } });
                    const response = await fetch(request);
                    if (
                        response.ok &&
                        response.headers.get('Content-Type')?.includes('text/html') &&
                        (await currentUserMatches(data.sub)) &&
                        (await activeUser()) === data.sub
                    ) {
                        await (await userCache(data.sub)).put(request, response);
                        if ((await activeUser()) !== data.sub) {
                            await (await userCache(data.sub)).delete(request);
                        }
                    }
                } catch {
                    // Keep the last verified account available during a network outage.
                } finally {
                    event.ports[0]?.postMessage('done');
                }
            })()
        );
    });

    worker.addEventListener('install', (event) => {
        event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
        void worker.skipWaiting();
    });

    worker.addEventListener('activate', (event) => {
        event.waitUntil(
            Promise.all([
                caches
                    .keys()
                    .then((keys) =>
                        Promise.all(
                            keys
                                .filter((key) => key.startsWith('rusys-public-') && key !== CACHE)
                                .map((key) => caches.delete(key))
                        )
                    ),
                worker.clients.claim(),
            ])
        );
    });

    worker.addEventListener('fetch', (event) => {
        const { request } = event;
        if (request.method !== 'GET') {
            return;
        }

        const url = new URL(request.url);
        if (url.origin !== worker.location.origin) {
            return;
        }

        if (
            url.pathname.startsWith('/_next/static/') ||
            url.pathname.startsWith('/assets/') ||
            url.pathname === '/manifest.json'
        ) {
            event.respondWith(
                caches.match(request).then(
                    (cached) =>
                        cached ||
                        fetch(request).then((response) => {
                            if (response.ok && response.type === 'basic') {
                                const copy = response.clone();
                                event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
                            }
                            return response;
                        })
                )
            );
            return;
        }

        if (url.pathname === IDENTITY_URL || url.pathname === '/sw.js') {
            return;
        }
        const isPrivate =
            request.mode === 'navigate' ||
            request.headers.has('RSC') ||
            url.pathname.startsWith('/api/v1/') ||
            url.pathname.startsWith('/images/') ||
            url.pathname.startsWith('/_next/image');
        if (isPrivate) {
            event.respondWith(
                (async () => {
                    const sub = await activeUser();
                    try {
                        const response = await fetch(request);
                        if (sub && response.ok) {
                            const copy = response.clone();
                            event.waitUntil(
                                (async () => {
                                    if ((await activeUser()) === sub && (await currentUserMatches(sub))) {
                                        await (await userCache(sub)).put(request, copy);
                                        if ((await activeUser()) !== sub) {
                                            await (await userCache(sub)).delete(request);
                                        }
                                    }
                                })().catch(() => undefined)
                            );
                        }
                        return response;
                    } catch {
                        if (sub) {
                            const cached = await (await userCache(sub)).match(request);
                            if (cached) {
                                return cached;
                            }
                        }
                        return request.mode === 'navigate'
                            ? (await caches.match(OFFLINE_URL)) || Response.error()
                            : Response.error();
                    }
                })()
            );
        }
    });
}
