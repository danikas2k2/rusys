import { installServiceWorker } from './Worker';

type WorkerEvent = {
    data?: { type?: string; sub?: string };
    request?: Request;
    source?: { url: string };
    ports?: { postMessage: ReturnType<typeof vi.fn> }[];
    waitUntil: (promise: Promise<unknown>) => void;
    respondWith: (promise: Promise<Response>) => void;
};

describe('offline service worker', () => {
    const origin = 'https://app.test';
    let listeners: Map<string, (event: WorkerEvent) => void>;
    let entries: Map<string, Map<string, Response>>;
    let fetchMock: ReturnType<typeof vi.fn>;
    let skipWaiting: ReturnType<typeof vi.fn>;
    let claim: ReturnType<typeof vi.fn>;

    const key = (request: Request | string) => (typeof request === 'string' ? request : request.url);
    const store = (name: string) => {
        let values = entries.get(name);
        if (!values) {
            values = new Map();
            entries.set(name, values);
        }
        return values;
    };
    const response = (body: string, contentType = 'text/html') =>
        new Response(body, { headers: { 'Content-Type': contentType } });
    const cache = (name: string) => ({
        match: async (request: Request | string) => store(name).get(key(request))?.clone(),
        put: async (request: Request | string, value: Response) => {
            store(name).set(key(request), value.clone());
        },
        delete: async (request: Request | string) => store(name).delete(key(request)),
        addAll: async (requests: string[]) => {
            for (const request of requests) {
                store(name).set(request, response(request));
            }
        },
    });

    async function dispatch(type: string, detail: Partial<WorkerEvent> = {}) {
        const pending: Promise<unknown>[] = [];
        let result: Promise<Response> | undefined;
        listeners.get(type)?.({
            ports: [],
            ...detail,
            waitUntil: (promise) => pending.push(promise),
            respondWith: (promise) => {
                result = promise;
            },
        });
        const served = await result;
        await Promise.all(pending);
        return served;
    }

    async function setUser(sub = 'alice', source = `${origin}/`) {
        const acknowledge = vi.fn();
        await dispatch('message', {
            data: { type: 'SET_USER', sub },
            source: { url: source },
            ports: [{ postMessage: acknowledge }],
        });
        return acknowledge;
    }

    beforeEach(() => {
        listeners = new Map();
        entries = new Map();
        skipWaiting = vi.fn();
        claim = vi.fn().mockResolvedValue(undefined);
        fetchMock = vi.fn(async (request: Request | string) => {
            const url = typeof request === 'string' ? request : request.url;
            return url === '/api/v1/offline/identity' ? Response.json({ sub: 'alice' }) : response(url);
        });
        vi.stubGlobal('self', {
            location: { origin },
            addEventListener: (name: string, handler: (event: WorkerEvent) => void) => listeners.set(name, handler),
            skipWaiting,
            clients: { claim },
        });
        vi.stubGlobal('caches', {
            open: async (name: string) => cache(name),
            keys: async () => [...entries.keys()],
            delete: async (name: string) => entries.delete(name),
            match: async (request: Request | string) => {
                for (const values of entries.values()) {
                    const value = values.get(key(request));
                    if (value) {
                        return value.clone();
                    }
                }
                return undefined;
            },
        });
        vi.stubGlobal('fetch', fetchMock);
        installServiceWorker();
    });

    afterEach(() => vi.unstubAllGlobals());

    it('precaches public assets and removes old public caches on activation', async () => {
        store('rusys-public-old').set('/old', response('old'));
        store('unrelated').set('/keep', response('keep'));
        await dispatch('install');
        expect(skipWaiting).toHaveBeenCalledOnce();
        expect(store('rusys-public-v2').has('/offline')).toBe(true);
        expect(store('rusys-public-v2').has('/manifest.json')).toBe(true);

        await dispatch('activate');
        expect(entries.has('rusys-public-old')).toBe(false);
        expect(entries.has('unrelated')).toBe(true);
        expect(claim).toHaveBeenCalledOnce();
    });

    it('serves cached assets and caches successful basic responses', async () => {
        const asset = new Request(`${origin}/assets/logo.svg`);
        store('rusys-public-v2').set(asset.url, response('cached'));
        expect((await dispatch('fetch', { request: asset }))?.status).toBe(200);
        expect(fetchMock).not.toHaveBeenCalled();

        const missing = new Request(`${origin}/_next/static/app.js`);
        fetchMock.mockImplementationOnce(async () => {
            const result = response('fresh', 'application/javascript');
            Object.defineProperty(result, 'type', { value: 'basic' });
            return result;
        });
        expect(await (await dispatch('fetch', { request: missing }))?.text()).toBe('fresh');
        expect(store('rusys-public-v2').has(missing.url)).toBe(true);
    });

    it('leaves non-cacheable requests to the network', async () => {
        for (const request of [
            new Request(`${origin}/api/v1/products`, { method: 'POST' }),
            new Request('https://other.test/assets/logo.svg'),
            new Request(`${origin}/api/v1/offline/identity`),
            new Request(`${origin}/sw.js`),
            new Request(`${origin}/ordinary`),
        ]) {
            expect(await dispatch('fetch', { request })).toBeUndefined();
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('refreshes the saved offline page only for a successful HTML response', async () => {
        await dispatch('message', { data: { type: 'REFRESH_OFFLINE_PAGE' } });
        expect(store('rusys-public-v2').has('/offline')).toBe(true);

        store('rusys-public-v2').delete('/offline');
        fetchMock.mockResolvedValueOnce(response('json', 'application/json'));
        await dispatch('message', { data: { type: 'REFRESH_OFFLINE_PAGE' } });
        expect(store('rusys-public-v2').has('/offline')).toBe(false);

        fetchMock.mockRejectedValueOnce(new Error('offline'));
        await expect(dispatch('message', { data: { type: 'REFRESH_OFFLINE_PAGE' } })).resolves.toBeUndefined();
    });

    it('verifies an account before caching its page and acknowledges the message', async () => {
        const acknowledge = await setUser();
        expect(acknowledge).toHaveBeenCalledWith('done');
        expect(await store('rusys-session-v1').get(`${origin}/__offline_user`)?.text()).toBe('alice');
        expect(store('rusys-private-v1-alice').has(`${origin}/`)).toBe(true);

        await dispatch('message', { data: { type: 'unrecognized' } });
        expect(store('rusys-session-v1').size).toBe(1);
    });

    it('rejects a mismatched identity and clears private data on sign-out', async () => {
        await setUser();
        await setUser('bob');
        expect(store('rusys-private-v1-alice').size).toBe(1);
        expect(store('rusys-private-v1-bob').size).toBe(0);

        const acknowledge = vi.fn();
        await dispatch('message', { data: { type: 'CLEAR_USER' }, ports: [{ postMessage: acknowledge }] });
        expect(acknowledge).toHaveBeenCalledWith('done');
        expect(entries.has('rusys-private-v1-alice')).toBe(false);
        expect(store('rusys-session-v1').size).toBe(0);
    });

    it('does not warm a page cache without a valid same-origin client', async () => {
        await dispatch('message', { data: { type: 'SET_USER', sub: 'alice' } });
        expect(store('rusys-private-v1-alice').size).toBe(0);

        await setUser('alice', `${origin}/offline`);
        await setUser('alice', 'https://other.test/');
        expect(store('rusys-private-v1-alice').size).toBe(0);
    });

    it('stores a successful private network response only for the verified active user', async () => {
        await setUser();
        const page = new Request(`${origin}/summary`);
        Object.defineProperty(page, 'mode', { value: 'navigate' });

        expect(await (await dispatch('fetch', { request: page }))?.text()).toBe(page.url);
        expect(store('rusys-private-v1-alice').has(page.url)).toBe(true);

        store('rusys-session-v1').delete(`${origin}/__offline_user`);
        const otherPage = new Request(`${origin}/categories`);
        Object.defineProperty(otherPage, 'mode', { value: 'navigate' });
        expect(await (await dispatch('fetch', { request: otherPage }))?.text()).toBe(otherPage.url);
        expect(store('rusys-private-v1-alice').has(otherPage.url)).toBe(false);
    });

    it('returns an error for an offline data request without a saved response', async () => {
        const request = new Request(`${origin}/api/v1/products`, { headers: { RSC: '1' } });
        fetchMock.mockRejectedValueOnce(new Error('offline'));

        expect((await dispatch('fetch', { request }))?.type).toBe('error');
    });

    it('uses a verified cached page when offline and otherwise shows the offline page', async () => {
        await setUser();
        const page = new Request(`${origin}/summary`);
        Object.defineProperty(page, 'mode', { value: 'navigate' });
        store('rusys-private-v1-alice').set(page.url, response('saved page'));
        fetchMock.mockRejectedValue(new Error('offline'));
        expect(await (await dispatch('fetch', { request: page }))?.text()).toBe('saved page');

        store('rusys-private-v1-alice').delete(page.url);
        store('rusys-public-v2').set('/offline', response('offline page'));
        expect(await (await dispatch('fetch', { request: page }))?.text()).toBe('offline page');
    });
});
