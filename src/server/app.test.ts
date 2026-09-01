import type { MockInstance } from 'vitest';

import fs from 'fs';
import https from 'https';

// @vitest-environment node
import express, { type Request, type Response } from 'express';
import type { Express } from 'express-serve-static-core';
import request from 'supertest';

import { debug } from '~/server/api/debug';
import { handleAdd } from '~/server/api/handleAdd';
import { handleCheckUser } from '~/server/api/handleCheckUser';
import { handleClientId } from '~/server/api/handleClientId';
import { handleDelete } from '~/server/api/handleDelete';
import { handleDeleteGroup } from '~/server/api/handleDeleteGroup';
import { handleDeleteVariant } from '~/server/api/handleDeleteVariant';
import { handleGroups } from '~/server/api/handleGroups';
import { handleMove } from '~/server/api/handleMove';
import { handleProductHistory } from '~/server/api/handleProductHistory';
import { handleProducts } from '~/server/api/handleProducts';
import { handleRedoProduct } from '~/server/api/handleRedoProduct';
import { handleRename } from '~/server/api/handleRename';
import { handleRenameGroup } from '~/server/api/handleRenameGroup';
import { handleRenameVariant } from '~/server/api/handleRenameVariant';
import { handleSetAmounts } from '~/server/api/handleSetAmounts';
import { handleSetMissing } from '~/server/api/handleSetMissing';
import { handleSetRemoving } from '~/server/api/handleSetRemoving';
import { handleSummary } from '~/server/api/handleSummary';
import { handleSummaryHistory } from '~/server/api/handleSummaryHistory';
import { handleUndoProduct } from '~/server/api/handleUndoProduct';
import { handleUpdateGroup } from '~/server/api/handleUpdateGroup';
import { handleUpdateVariant } from '~/server/api/handleUpdateVariant';
import { handleUpsertUserProfile } from '~/server/api/handleUpsertUserProfile';
import { handleUserProfiles } from '~/server/api/handleUserProfiles';
import { handleVariants } from '~/server/api/handleVariants';
import { setup, startHttpServer, startHttpsServer, startServers } from '~/server/app';
import { ApiUrl } from '~/types/api';

vi.mock(import('~/server/api/debug'));

// Client/User
vi.mock(import('~/server/api/handleClientId'));
vi.mock(import('~/server/api/handleCheckUser'));
vi.mock(import('~/server/api/handleUpsertUserProfile'));
vi.mock(import('~/server/api/handleUserProfiles'));

// Summary
vi.mock(import('~/server/api/handleSummary'));

// Products
vi.mock(import('~/server/api/handleAdd'));
vi.mock(import('~/server/api/handleProducts'));
vi.mock(import('~/server/api/handleSetAmounts'));
vi.mock(import('~/server/api/handleSetRemoving'));
vi.mock(import('~/server/api/handleSetMissing'));
vi.mock(import('~/server/api/handleRename'));
vi.mock(import('~/server/api/handleMove'));
vi.mock(import('~/server/api/handleDelete'));

// History
vi.mock(import('~/server/api/handleProductHistory'));
vi.mock(import('~/server/api/handleUndoProduct'));
vi.mock(import('~/server/api/handleRedoProduct'));
vi.mock(import('~/server/api/handleSummaryHistory'));

// Groups
vi.mock(import('~/server/api/handleGroups'));
vi.mock(import('~/server/api/handleUpdateGroup'));
vi.mock(import('~/server/api/handleRenameGroup'));
vi.mock(import('~/server/api/handleDeleteGroup'));

// Variants
vi.mock(import('~/server/api/handleVariants'));
vi.mock(import('~/server/api/handleUpdateVariant'));
vi.mock(import('~/server/api/handleRenameVariant'));
vi.mock(import('~/server/api/handleDeleteVariant'));
vi.mock(import('~/server/api/handleCopyVariant'));
vi.mock(import('~/server/api/handleReorderGroups'));
vi.mock(import('~/server/api/handleReorderVariants'));
vi.mock(import('~/server/api/handleExport'));
vi.mock(import('~/server/api/handleImport'));

describe('app', () => {
    afterEach(() => vi.clearAllMocks());

    describe('handle requests', () => {
        let app: Express;
        const handler = async (_req: Request, res: Response): Promise<void> => void res.json({ ok: true });

        beforeAll(() => {
            app = setup(express());
        });

        describe.each`
            url                           | handle
            ${ApiUrl.ClientId}            | ${handleClientId}
            ${ApiUrl.CheckUser}           | ${handleCheckUser}
            ${ApiUrl.UserProfileUpsert}   | ${handleUpsertUserProfile}
            ${ApiUrl.UserProfiles}        | ${handleUserProfiles}
            ${ApiUrl.Summary}             | ${handleSummary}
            ${ApiUrl.Products}            | ${handleProducts}
            ${ApiUrl.ProductsSetAmounts}  | ${handleSetAmounts}
            ${ApiUrl.ProductsAdd}         | ${handleAdd}
            ${ApiUrl.ProductsHistory}     | ${handleProductHistory}
            ${ApiUrl.ProductsUndo}        | ${handleUndoProduct}
            ${ApiUrl.ProductsRedo}        | ${handleRedoProduct}
            ${ApiUrl.SummaryHistory}      | ${handleSummaryHistory}
            ${ApiUrl.ProductsSetRemoving} | ${handleSetRemoving}
            ${ApiUrl.ProductsSetMissing}  | ${handleSetMissing}
            ${ApiUrl.ProductsRename}      | ${handleRename}
            ${ApiUrl.ProductsMove}        | ${handleMove}
            ${ApiUrl.ProductsDelete}      | ${handleDelete}
            ${ApiUrl.Groups}              | ${handleGroups}
            ${ApiUrl.GroupsUpdate}        | ${handleUpdateGroup}
            ${ApiUrl.GroupsRename}        | ${handleRenameGroup}
            ${ApiUrl.GroupsDelete}        | ${handleDeleteGroup}
            ${ApiUrl.Variants}            | ${handleVariants}
            ${ApiUrl.VariantsUpdate}      | ${handleUpdateVariant}
            ${ApiUrl.VariantsRename}      | ${handleRenameVariant}
            ${ApiUrl.VariantsDelete}      | ${handleDeleteVariant}
        `('request $url', ({ url, handle }: { url: string; handle: (...args: any[]) => any }) => {
            beforeEach(() => {
                vi.mocked(handle).mockImplementation(handler);
            });

            it('responds to POST', async () => {
                const response = await request(app).post(url);

                expect(response.status).toBe(200);
                expect(handle).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(app).get(url);

                expect(response.status).toBe(404);
                expect(handle).not.toHaveBeenCalled();
            });
        });

        describe('request /*', () => {
            it('does not respond to GET', async () => {
                const response = await request(app).get('/other');

                expect(response.status).toBe(404);
            });

            it('does not respond to POST', async () => {
                const response = await request(app).post('/other');

                expect(response.status).toBe(404);
            });
        });
    });

    describe('setup', () => {
        const app = express();

        it('setup app over existing express server', async () => {
            expect(setup(app)).toBe(app);
        });

        it('setup app with auto-created express server', async () => {
            expect(setup()).toBeInstanceOf(Function);
        });
    });

    describe('setupHelmet dev-mode STS header middleware', () => {
        it('sets Strict-Transport-Security: max-age=0 in dev mode', async () => {
            // setup() runs in dev mode (NODE_ENV !== 'production') so the STS header middleware is active
            const app = setup(express());
            app.get('/probe-sts', (_req, res) => res.status(200).json({ ok: true }));

            const response = await request(app).get('/probe-sts');

            expect(response.headers['strict-transport-security']).toBe('max-age=0');
        });
    });

    describe('startHttpServer', () => {
        const app = { listen: vi.fn((_host: unknown, _port: unknown, cb: () => void) => cb()) } as unknown as Express;

        it('starts the HTTP server with default options', () => {
            expect(startHttpServer(app, {})).toBe(app);
            expect(app.listen).toHaveBeenCalledWith(3000, 'localhost', expect.any(Function));
            expect(debug).toHaveBeenCalledWith('HTTP server listening on http://localhost:3000');
        });

        it('starts the HTTP server with custom options', () => {
            expect(startHttpServer(app, { port: 8080, host: '127.0.0.1' })).toBe(app);
            expect(app.listen).toHaveBeenCalledWith(8080, '127.0.0.1', expect.any(Function));
            expect(debug).toHaveBeenCalledWith('HTTP server listening on http://127.0.0.1:8080');
        });
    });

    describe('startHttpsServer', () => {
        const app = {} as unknown as Express;
        const listen = vi.fn((_host: unknown, _port: unknown, cb: () => void) => cb());
        const keys = { keyFile: 'key.pem', certFile: 'cert.pem' };

        let readFileSync: MockInstance;
        let createServer: MockInstance;

        beforeEach(() => {
            readFileSync = vi.spyOn(fs, 'readFileSync').mockReturnValue('mocked-content');
            createServer = vi.spyOn(https, 'createServer').mockReturnValue({ listen } as unknown as https.Server);
        });

        afterAll(() => vi.restoreAllMocks());

        it('starts the HTTPS server with valid key and cert files, and default port/server options', () => {
            expect(startHttpsServer(app, keys)).toBe(app);
            expect(readFileSync).toHaveBeenCalledWith('key.pem');
            expect(readFileSync).toHaveBeenCalledWith('cert.pem');
            expect(createServer).toHaveBeenCalledWith({ key: 'mocked-content', cert: 'mocked-content' }, app);
            expect(listen).toHaveBeenCalledWith(4000, 'localhost', expect.any(Function));
            expect(debug).toHaveBeenCalledWith('HTTPS server listening on https://localhost:4000');
        });

        it('starts the HTTPS server with valid key and cert files, and custom port/server options', () => {
            expect(startHttpsServer(app, { port: 8443, host: '127.0.0.1', ...keys })).toBe(app);
            expect(readFileSync).toHaveBeenCalledWith('key.pem');
            expect(readFileSync).toHaveBeenCalledWith('cert.pem');
            expect(createServer).toHaveBeenCalledWith({ key: 'mocked-content', cert: 'mocked-content' }, app);
            expect(listen).toHaveBeenCalledWith(8443, '127.0.0.1', expect.any(Function));
            expect(debug).toHaveBeenCalledWith('HTTPS server listening on https://127.0.0.1:8443');
        });

        it('does not start the HTTPS server if key or cert files are missing', () => {
            expect(startHttpsServer(app, {})).toBe(app);
            expect(createServer).not.toHaveBeenCalled();
            expect(debug).not.toHaveBeenCalled();
        });
    });

    describe('startServers', () => {
        const app = { listen: vi.fn((_port: unknown, _host: unknown, cb: () => void) => cb()) } as unknown as Express;

        let readFileSync: MockInstance;
        let createServer: MockInstance;

        beforeEach(() => {
            readFileSync = vi.spyOn(fs, 'readFileSync').mockReturnValue('mocked-content');
            createServer = vi
                .spyOn(https, 'createServer')
                .mockReturnValue({ listen: vi.fn() } as unknown as https.Server);
        });

        afterEach(() => vi.restoreAllMocks());

        it('starts HTTP server using default env vars', () => {
            const savedEnv = { ...process.env };
            delete process.env.PORT;
            delete process.env.HOST;
            delete process.env.HTTPS_PORT;
            delete process.env.HTTPS_HOST;
            delete process.env.HTTPS_KEY;
            delete process.env.HTTPS_CERT;

            startServers(app);
            Object.assign(process.env, savedEnv);

            expect(app.listen).toHaveBeenCalledWith(3000, 'localhost', expect.any(Function));
            expect(debug).toHaveBeenCalledWith('HTTP server listening on http://localhost:3000');
        });

        it('starts HTTP server using custom PORT and HOST env vars', () => {
            const savedEnv = { ...process.env };
            process.env.PORT = '8080';
            process.env.HOST = '0.0.0.0';
            delete process.env.HTTPS_KEY;
            delete process.env.HTTPS_CERT;

            startServers(app);
            Object.assign(process.env, savedEnv);

            expect(app.listen).toHaveBeenCalledWith(8080, '0.0.0.0', expect.any(Function));
            expect(debug).toHaveBeenCalledWith('HTTP server listening on http://0.0.0.0:8080');
        });

        it('starts HTTPS server when HTTPS_KEY and HTTPS_CERT env vars are set', () => {
            const savedEnv = { ...process.env };
            process.env.PORT = '3000';
            process.env.HOST = 'localhost';
            process.env.HTTPS_PORT = '4000';
            process.env.HTTPS_HOST = 'localhost';
            process.env.HTTPS_KEY = 'key.pem';
            process.env.HTTPS_CERT = 'cert.pem';

            startServers(app);
            Object.assign(process.env, savedEnv);

            expect(readFileSync).toHaveBeenCalledWith('key.pem');
            expect(readFileSync).toHaveBeenCalledWith('cert.pem');
            expect(createServer).toHaveBeenCalledWith(expect.objectContaining({ key: 'mocked-content' }), app);
        });
    });
});

describe('app (prod mode)', () => {
    // Re-import app with isDevMode returning false to test the prod-only branches
    let setupHelmetProd: typeof import('~/server/app').setupHelmet; // oxlint-disable-line typescript/consistent-type-imports

    beforeAll(async () => {
        vi.doMock(import('~/common/utils/dev'), () => ({ isDevMode: () => false }));
        vi.resetModules();
        setupHelmetProd = (await import('~/server/app')).setupHelmet;
    });

    afterEach(() => vi.clearAllMocks());

    afterAll(() => {
        vi.resetModules();
        vi.doUnmock('~/common/utils/dev');
    });

    describe('setupHelmet HTTPS redirect middleware', () => {
        it('calls next() when req.secure is true', async () => {
            const app = express();
            setupHelmetProd(app);

            const response = await request(app)
                .get('/any')
                .set('X-Forwarded-Proto', 'https')
                .set('X-Forwarded-Ssl', 'on');

            // The request goes through (no redirect) — we just verify no 308
            expect(response.status).not.toBe(308);
        });

        it('calls next() when x-forwarded-proto is https', async () => {
            const app = express();
            setupHelmetProd(app);

            const response = await request(app).get('/any').set('X-Forwarded-Proto', 'https');

            expect(response.status).not.toBe(308);
        });

        it('calls next() when request has no host header', async () => {
            const app = express();
            setupHelmetProd(app);
            // Add a simple handler so we can confirm request reaches it
            app.get('/probe', (_req, res) => res.status(200).json({ ok: true }));

            // An empty Host header value is falsy, so the middleware calls next() without redirecting
            const response = await request(app).get('/probe').set('X-Forwarded-Proto', 'http').set('Host', '');

            // Without a valid host header the middleware calls next(), so our handler responds
            expect(response.status).toBe(200);
        });

        it('redirects 308 to https when x-forwarded-proto header is absent entirely', async () => {
            const app = express();
            setupHelmetProd(app);

            const response = await request(app).get('/path?q=1').set('Host', 'example.com');

            expect(response.status).toBe(308);
            expect(response.headers.location).toBe('https://example.com/path?q=1');
        });

        it('redirects 308 to https when request is plain http with a host header', async () => {
            const app = express();
            setupHelmetProd(app);

            const response = await request(app)
                .get('/path?q=1')
                .set('X-Forwarded-Proto', 'http')
                .set('Host', 'example.com');

            expect(response.status).toBe(308);
            expect(response.headers.location).toBe('https://example.com/path?q=1');
        });
    });
});
