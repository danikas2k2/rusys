import type { MockInstance } from 'vitest';

import fs from 'fs';
import https from 'https';

// @vitest-environment node
import express, { type Express } from 'express';
import request from 'supertest';

import { debug } from '~/server/api/debug';
import { setup, setupHandlers, startHttpServer, startHttpsServer } from '~/server/app';

vi.mock(import('~/server/api/debug'));

describe('app', () => {
    afterEach(() => vi.clearAllMocks());

    it('sets up an existing or a new Express application', () => {
        const app = express();

        expect(setup(app)).toBe(app);
        expect(setup()).toBeInstanceOf(Function);
    });

    it('mounts only the versioned API', async () => {
        const app = setupHandlers(express());

        expect((await request(app).post('/products')).status).toBe(404);
        expect((await request(app).get('/api/v1/not-found')).status).toBe(404);
    });

    it('sets the development STS header', async () => {
        const app = setup(express());
        app.get('/probe', (_req, res) => res.status(200).end());

        const response = await request(app).get('/probe');

        expect(response.headers['strict-transport-security']).toBe('max-age=0');
    });

    it('starts HTTP with the configured address', () => {
        const app = {
            listen: vi.fn((_port: unknown, _host: unknown, callback: () => void) => callback()),
        } as unknown as Express;

        expect(startHttpServer(app, { port: 8080, host: '127.0.0.1' })).toBe(app);
        expect(app.listen).toHaveBeenCalledWith(8080, '127.0.0.1', expect.any(Function));
        expect(debug).toHaveBeenCalledWith('HTTP server listening on http://127.0.0.1:8080');
    });

    describe('HTTPS server', () => {
        const app = {} as Express;
        const listen = vi.fn((_port: unknown, _host: unknown, callback: () => void) => callback());
        let createServer: MockInstance;

        beforeEach(() => {
            vi.spyOn(fs, 'readFileSync').mockReturnValue('certificate');
            createServer = vi.spyOn(https, 'createServer').mockReturnValue({ listen } as unknown as https.Server);
        });

        afterEach(() => vi.restoreAllMocks());

        it('starts only when both certificate files are configured', () => {
            expect(startHttpsServer(app, { keyFile: 'key.pem', certFile: 'cert.pem' })).toBe(app);
            expect(createServer).toHaveBeenCalledWith({ key: 'certificate', cert: 'certificate' }, app);
            expect(listen).toHaveBeenCalledWith(4000, 'localhost', expect.any(Function));
        });

        it('does not start without both certificate files', () => {
            startHttpsServer(app, { keyFile: 'key.pem' });

            expect(createServer).not.toHaveBeenCalled();
        });
    });
});
