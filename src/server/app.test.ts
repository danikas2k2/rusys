/** @jest-environment node */
import fs from 'fs';
import https from 'https';

import express, { type Request, type Response } from 'express';
import type { Express } from 'express-serve-static-core';
import request from 'supertest';

import { debug } from '~/server/api/debug';
import { handleAdd } from '~/server/api/handleAdd';
import { handleCheckUser } from '~/server/api/handleCheckUser';
import { handleClientId } from '~/server/api/handleClientId';
import { handleDelete } from '~/server/api/handleDelete';
import { handleDeleteProductsHistory } from '~/server/api/handleDeleteProductsHistory';
import { handleDeleteGroup } from '~/server/api/handleDeleteGroup';
import { handleDeleteVariant } from '~/server/api/handleDeleteVariant';
import { handleGroups } from '~/server/api/handleGroups';
import { handleMoveProductsHistory } from '~/server/api/handleMoveProductsHistory';
import { handleMove } from '~/server/api/handleMove';
import { handleProducts } from '~/server/api/handleProducts';
import { handleProductsHistory } from '~/server/api/handleProductsHistory';
import { handleRename } from '~/server/api/handleRename';
import { handleRenameGroup } from '~/server/api/handleRenameGroup';
import { handleRenameVariant } from '~/server/api/handleRenameVariant';
import { handleSetMissing } from '~/server/api/handleSetMissing';
import { handleSetRemoving } from '~/server/api/handleSetRemoving';
import { handleSummary } from '~/server/api/handleSummary';
import { handleUpdateGroup } from '~/server/api/handleUpdateGroup';
import { handleUpdateProduct } from '~/server/api/handleUpdateProduct';
import { handleUpdateProductsHistory } from '~/server/api/handleUpdateProductsHistory';
import { handleUpdateVariant } from '~/server/api/handleUpdateVariant';
import { handleUpsertUserProfile } from '~/server/api/handleUpsertUserProfile';
import { handleUserProfiles } from '~/server/api/handleUserProfiles';
import { handleVariants } from '~/server/api/handleVariants';
import { setup, startHttpServer, startHttpsServer } from '~/server/app';
import { ApiUrl } from '~/types/api';

jest.mock('~/server/api/debug');

// Client/User
jest.mock('~/server/api/handleClientId', () => ({ handleClientId: jest.fn() }));
jest.mock('~/server/api/handleCheckUser', () => ({ handleCheckUser: jest.fn() }));
jest.mock('~/server/api/handleUpsertUserProfile', () => ({ handleUpsertUserProfile: jest.fn() }));
jest.mock('~/server/api/handleUserProfiles', () => ({ handleUserProfiles: jest.fn() }));

// Summary
jest.mock('~/server/api/handleSummary', () => ({ handleSummary: jest.fn() }));

// Products
jest.mock('~/server/api/handleAdd', () => ({ handleAdd: jest.fn() }));
jest.mock('~/server/api/handleProducts', () => ({ handleProducts: jest.fn() }));
jest.mock('~/server/api/handleUpdateProduct', () => ({ handleUpdateProduct: jest.fn() }));
jest.mock('~/server/api/handleProductsHistory', () => ({ handleProductsHistory: jest.fn() }));
jest.mock('~/server/api/handleUpdateProductsHistory', () => ({ handleUpdateProductsHistory: jest.fn() }));
jest.mock('~/server/api/handleDeleteProductsHistory', () => ({ handleDeleteProductsHistory: jest.fn() }));
jest.mock('~/server/api/handleMoveProductsHistory', () => ({ handleMoveProductsHistory: jest.fn() }));
jest.mock('~/server/api/handleSetRemoving', () => ({ handleSetRemoving: jest.fn() }));
jest.mock('~/server/api/handleSetMissing', () => ({ handleSetMissing: jest.fn() }));
jest.mock('~/server/api/handleRename', () => ({ handleRename: jest.fn() }));
jest.mock('~/server/api/handleMove', () => ({ handleMove: jest.fn() }));
jest.mock('~/server/api/handleDelete', () => ({ handleDelete: jest.fn() }));

// Groups
jest.mock('~/server/api/handleGroups', () => ({ handleGroups: jest.fn() }));
jest.mock('~/server/api/handleUpdateGroup', () => ({ handleUpdateGroup: jest.fn() }));
jest.mock('~/server/api/handleRenameGroup', () => ({ handleRenameGroup: jest.fn() }));
jest.mock('~/server/api/handleDeleteGroup', () => ({ handleDeleteGroup: jest.fn() }));

// Variants
jest.mock('~/server/api/handleVariants', () => ({ handleVariants: jest.fn() }));
jest.mock('~/server/api/handleUpdateVariant', () => ({ handleUpdateVariant: jest.fn() }));
jest.mock('~/server/api/handleRenameVariant', () => ({ handleRenameVariant: jest.fn() }));
jest.mock('~/server/api/handleDeleteVariant', () => ({ handleDeleteVariant: jest.fn() }));

describe('app', () => {
    afterEach(() => jest.clearAllMocks());

    describe('handle requests', () => {
        const app = setup(express());
        const handler = async (_req: Request, res: Response): Promise<void> => void res.json({ ok: true });

        describe.each`
            url                           | handle
            ${ApiUrl.ClientId}            | ${handleClientId}
            ${ApiUrl.CheckUser}           | ${handleCheckUser}
            ${ApiUrl.UserProfileUpsert}   | ${handleUpsertUserProfile}
            ${ApiUrl.UserProfiles}        | ${handleUserProfiles}
            ${ApiUrl.Summary}             | ${handleSummary}
            ${ApiUrl.Products}            | ${handleProducts}
            ${ApiUrl.ProductsUpdate}      | ${handleUpdateProduct}
            ${ApiUrl.ProductsAdd}         | ${handleAdd}
            ${ApiUrl.ProductsHistory}     | ${handleProductsHistory}
            ${ApiUrl.ProductsHistoryUpdate} | ${handleUpdateProductsHistory}
            ${ApiUrl.ProductsHistoryDelete} | ${handleDeleteProductsHistory}
            ${ApiUrl.ProductsHistoryMove} | ${handleMoveProductsHistory}
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
        `('request $url', ({ url, handle }) => {
            beforeEach(() => jest.mocked(handle).mockImplementation(handler));

            it('responds to POST', async () => {
                const response = await request(app).post(url);

                expect(response.status).toBe(200);
                // eslint-disable-next-line jest/prefer-called-with
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
            expect(setup()).toBeFunction();
        });
    });

    describe('startHttpServer', () => {
        const app = { listen: jest.fn((host, port, cb) => cb()) } as unknown as Express;

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
        const listen = jest.fn((host, port, cb) => cb());
        const keys = { keyFile: 'key.pem', certFile: 'cert.pem' };

        let readFileSync: jest.SpyInstance;
        let createServer: jest.SpyInstance;

        beforeEach(() => {
            readFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue('mocked-content');
            createServer = jest.spyOn(https, 'createServer').mockReturnValue({ listen } as unknown as https.Server);
        });

        afterAll(() => jest.restoreAllMocks());

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
});
