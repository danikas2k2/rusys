import vm from 'node:vm';

import { installServiceWorker } from '~/components/app/ServiceWorker/Worker';
import { GET } from './sw.js/route';

interface FetchEvent {
    request: Request;
    respondWith: (response: Promise<Response>) => void;
    waitUntil: (promise: Promise<unknown>) => void;
}

interface MessageEvent {
    data: { type: string; sub?: string };
    source: { url: string };
    ports: { postMessage: (value: string) => void }[];
    waitUntil: (promise: Promise<unknown>) => void;
}

function workerHarness(fetch: typeof globalThis.fetch) {
    const listeners = new Map<string, (event: unknown) => void>();
    const storage = new Map<string, Map<string, Response>>();
    const key = (request: string | Request) =>
        typeof request === 'string' ? new URL(request, 'https://rusys.test').href : request.url;
    const cacheFor = (name: string) => {
        if (!storage.has(name)) {
            storage.set(name, new Map());
        }
        const entries = storage.get(name)!;
        return {
            addAll: vi.fn(),
            match: async (request: string | Request) => entries.get(key(request))?.clone(),
            put: async (request: string | Request, response: Response) => {
                entries.set(key(request), response);
            },
            delete: async (request: string | Request) => entries.delete(key(request)),
        };
    };
    const caches = {
        open: async (name: string) => cacheFor(name),
        match: async (request: string | Request) => {
            for (const entries of storage.values()) {
                if (entries.has(key(request))) {
                    return entries.get(key(request))?.clone();
                }
            }
        },
        keys: async () => [...storage.keys()],
        delete: async (name: string) => storage.delete(name),
    };
    const self = {
        location: { origin: 'https://rusys.test' },
        addEventListener: (name: string, handler: (event: unknown) => void) => listeners.set(name, handler),
        skipWaiting: vi.fn(),
        clients: { claim: vi.fn() },
    };
    vm.runInNewContext(`(${installServiceWorker.toString()})();`, { self, caches, fetch, URL, Request, Response });

    async function message(data: MessageEvent['data'], url = 'https://rusys.test/products') {
        const handler = listeners.get('message');
        if (!handler) {
            throw new Error('Missing message handler');
        }
        let work: Promise<unknown> | undefined;
        handler({
            data,
            source: { url },
            ports: [{ postMessage: vi.fn() }],
            waitUntil: (promise: Promise<unknown>) => {
                work = promise;
            },
        } satisfies MessageEvent);
        await work;
    }

    async function fetchThroughWorker(url: string, mode = 'cors', headers = new Headers()) {
        const handler = listeners.get('fetch');
        if (!handler) {
            throw new Error('Missing fetch handler');
        }
        let response: Promise<Response> | undefined;
        const background: Promise<unknown>[] = [];
        handler({
            request: { url, method: 'GET', mode, headers } as Request,
            respondWith: (value: Promise<Response>) => {
                response = value;
            },
            waitUntil: (value: Promise<unknown>) => background.push(value),
        } satisfies FetchEvent);
        if (!response) {
            return undefined;
        }
        const result = await response;
        await Promise.all(background);
        return result;
    }

    return { cacheFor, storage, message, fetchThroughWorker };
}

describe('service worker', () => {
    it('is served as JavaScript by the Next.js route', async () => {
        const response = GET();
        const javascript = await response.text();

        expect(response.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8');
        expect(response.headers.get('Cache-Control')).toContain('no-store');
        expect(() => new vm.Script(javascript)).not.toThrow();
        expect(javascript).toContain('/offline');
    });

    it('uses cached public assets before the network', async () => {
        const fetch = vi.fn();
        const worker = workerHarness(fetch);
        const asset = new Response('logo');
        await worker.cacheFor('rusys-public-v2').put('/assets/logo.svg', asset);

        await expect((await worker.fetchThroughWorker('https://rusys.test/assets/logo.svg'))?.text()).resolves.toBe(
            'logo'
        );
        expect(fetch).not.toHaveBeenCalled();
    });

    it('updates the cached offline page after a language change', async () => {
        const fetch = vi.fn(
            async () =>
                new Response('Lithuanian offline page', {
                    headers: { 'Content-Type': 'text/html' },
                })
        );
        const worker = workerHarness(fetch);
        await worker.cacheFor('rusys-public-v2').put('/offline', new Response('English offline page'));

        await worker.message({ type: 'REFRESH_OFFLINE_PAGE' });

        expect(fetch).toHaveBeenCalledWith('/offline', { cache: 'no-store', credentials: 'include' });
        await expect((await worker.cacheFor('rusys-public-v2').match('/offline'))?.text()).resolves.toBe(
            'Lithuanian offline page'
        );
    });

    it('caches private pages for the verified user and reads them when offline', async () => {
        let offline = false;
        const fetch = vi.fn(async (request: Request | string) => {
            const url = typeof request === 'string' ? request : request.url;
            if (url === '/api/v1/offline/identity') {
                return Response.json({ sub: 'alice' });
            }
            if (offline) {
                throw new Error('offline');
            }
            return new Response('Alice page', { headers: { 'Content-Type': 'text/html' } });
        });
        const worker = workerHarness(fetch);
        await worker.message({ type: 'SET_USER', sub: 'alice' });
        offline = true;

        await expect(
            (await worker.fetchThroughWorker('https://rusys.test/products', 'navigate'))?.text()
        ).resolves.toBe('Alice page');
        expect(worker.storage.has('rusys-private-v1-alice')).toBe(true);
    });

    it('refreshes cached private data from the network before serving it offline', async () => {
        let content = 'old';
        const fetch = vi.fn(async (request: Request | string) => {
            if ((typeof request === 'string' ? request : request.url) === '/api/v1/offline/identity') {
                return Response.json({ sub: 'alice' });
            }
            if (content === 'offline') {
                throw new Error('offline');
            }
            return new Response(content, { headers: { 'Content-Type': 'text/html' } });
        });
        const worker = workerHarness(fetch);
        await worker.message({ type: 'SET_USER', sub: 'alice' });
        content = 'new';

        await expect(worker.fetchThroughWorker('https://rusys.test/products', 'navigate')).resolves.toBeDefined();

        content = 'offline';
        const cached = await worker.fetchThroughWorker('https://rusys.test/products', 'navigate');

        await expect(cached?.text()).resolves.toBe('new');
    });

    it('removes private data on logout', async () => {
        const fetch = vi.fn(async (request: Request | string) =>
            (typeof request === 'string' ? request : request.url) === '/api/v1/offline/identity'
                ? Response.json({ sub: 'alice' })
                : new Response('Alice page', { headers: { 'Content-Type': 'text/html' } })
        );
        const worker = workerHarness(fetch);
        await worker.message({ type: 'SET_USER', sub: 'alice' });
        await worker.message({ type: 'CLEAR_USER' });

        expect(worker.storage.has('rusys-private-v1-alice')).toBe(false);
        await expect(
            worker.cacheFor('rusys-session-v1').match('https://rusys.test/__offline_user')
        ).resolves.toBeUndefined();
    });

    it('does not mix cached pages when the account changes', async () => {
        let signedIn = 'alice';
        const fetch = vi.fn(async (request: Request | string) =>
            (typeof request === 'string' ? request : request.url) === '/api/v1/offline/identity'
                ? Response.json({ sub: signedIn })
                : new Response(`${signedIn} page`, { headers: { 'Content-Type': 'text/html' } })
        );
        const worker = workerHarness(fetch);
        await worker.message({ type: 'SET_USER', sub: 'alice' });
        signedIn = 'bob';
        await worker.message({ type: 'SET_USER', sub: 'bob' });

        expect(worker.storage.has('rusys-private-v1-alice')).toBe(false);
        await expect(
            (await worker.cacheFor('rusys-private-v1-bob').match('https://rusys.test/products'))?.text()
        ).resolves.toBe('bob page');
    });

    it('does not store a page for a user who lacks a matching server session', async () => {
        const fetch = vi.fn(async (request: Request | string) =>
            (typeof request === 'string' ? request : request.url) === '/api/v1/offline/identity'
                ? Response.json({ sub: 'bob' })
                : new Response('Bob page', { headers: { 'Content-Type': 'text/html' } })
        );
        const worker = workerHarness(fetch);
        await worker.message({ type: 'SET_USER', sub: 'alice' });

        expect(worker.storage.has('rusys-private-v1-alice')).toBe(false);
    });
});
