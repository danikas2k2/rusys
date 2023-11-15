import express, { type Request, type Response } from 'express';
import request from 'supertest';
import app from '~/server/app';
import { handleCheckUser } from '~/server/app/handleCheckUser';
import { handleClientId } from '~/server/app/handleClientId';
import { handleLoad } from '~/server/app/handleLoad';
import { handleMove } from '~/server/app/handleMove';
import { handleRemove } from '~/server/app/handleRemove';
import { handleRemoveGroup } from '~/server/app/handleRemoveGroup';
import { handleRename } from '~/server/app/handleRename';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { handleSetDetails } from '~/server/app/handleSetDetails';
import { handleSetMissing } from '~/server/app/handleSetMissing';
import { handleSetRemoving } from '~/server/app/handleSetRemoving';
import { handleSummary } from '~/server/app/handleSummary';
import { handleUpdateDetails } from '~/server/app/handleUpdateDetails';

jest.mock('~/server/app/handleCheckUser');
jest.mock('~/server/app/handleClientId');
jest.mock('~/server/app/handleLoad');
jest.mock('~/server/app/handleMove', () => ({ handleMove: jest.fn() }));
jest.mock('~/server/app/handleRemove', () => ({ handleRemove: jest.fn() }));
jest.mock('~/server/app/handleRemoveGroup', () => ({ handleRemoveGroup: jest.fn() }));
jest.mock('~/server/app/handleRename', () => ({ handleRename: jest.fn() }));
jest.mock('~/server/app/handleRenameGroup', () => ({ handleRenameGroup: jest.fn() }));
jest.mock('~/server/app/handleSetDetails', () => ({ handleSetDetails: jest.fn() }));
jest.mock('~/server/app/handleSetMissing', () => ({ handleSetMissing: jest.fn() }));
jest.mock('~/server/app/handleSetRemoving', () => ({ handleSetRemoving: jest.fn() }));
jest.mock('~/server/app/handleSummary', () => ({ handleSummary: jest.fn() }));
jest.mock('~/server/app/handleUpdateDetails', () => ({ handleUpdateDetails: jest.fn() }));

describe('app', () => {
    const server = app(express());
    const handler = (_req: Request, res: Response): Response => res.json({ ok: true });

    afterEach(() => jest.clearAllMocks());

    describe('request /clientId', () => {
        (handleClientId as jest.Mock).mockImplementation(handler);

        it('responds to GET', async () => {
            const response = await request(server).get('/clientId');
            expect(response.status).toBe(200);
            expect(handleClientId).toHaveBeenCalled();
        });

        it('does not respond to POST', async () => {
            const response = await request(server).post('/clientId');
            expect(response.status).toBe(404);
            expect(handleClientId).not.toHaveBeenCalled();
        });
    });

    describe('request /checkUser', () => {
        (handleCheckUser as jest.Mock).mockImplementation(handler);

        it('responds to POST', async () => {
            const response = await request(server).post('/checkUser');
            expect(response.status).toBe(200);
            expect(handleCheckUser).toHaveBeenCalled();
        });

        it('does not respond to GET', async () => {
            const response = await request(server).get('/checkUser');
            expect(response.status).toBe(404);
            expect(handleCheckUser).not.toHaveBeenCalled();
        });
    });

    describe('request /load', () => {
        (handleLoad as jest.Mock).mockImplementation(handler);

        it('responds to GET', async () => {
            const response = await request(server).get('/load');
            expect(response.status).toBe(200);
            expect(handleLoad).toHaveBeenCalled();
        });

        it('does not respond to POST', async () => {
            const response = await request(server).post('/load');
            expect(response.status).toBe(404);
            expect(handleLoad).not.toHaveBeenCalled();
        });
    });

    describe('request /summary', () => {
        (handleSummary as jest.Mock).mockImplementation(handler);

        it('responds to GET', async () => {
            const response = await request(server).get('/summary');
            expect(response.status).toBe(200);
            expect(handleSummary).toHaveBeenCalled();
        });

        it('does not respond to POST', async () => {
            const response = await request(server).post('/summary');
            expect(response.status).toBe(404);
            expect(handleSummary).not.toHaveBeenCalled();
        });
    });

    describe('request /setDetails', () => {
        (handleSetDetails as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/setDetails');
            expect(response.status).toBe(200);
            expect(handleSetDetails).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/setDetails');
            expect(response.status).toBe(404);
            expect(handleSetDetails).not.toHaveBeenCalled();
        });
    });

    describe('request /updateDetails', () => {
        (handleUpdateDetails as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/updateDetails');
            expect(response.status).toBe(200);
            expect(handleUpdateDetails).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/updateDetails');
            expect(response.status).toBe(404);
            expect(handleUpdateDetails).not.toHaveBeenCalled();
        });
    });

    describe('request /setRemoving', () => {
        (handleSetRemoving as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/setRemoving');
            expect(response.status).toBe(200);
            expect(handleSetRemoving).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/setRemoving');
            expect(response.status).toBe(404);
            expect(handleSetRemoving).not.toHaveBeenCalled();
        });
    });

    describe('request /setMissing', () => {
        (handleSetMissing as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/setMissing');
            expect(response.status).toBe(200);
            expect(handleSetMissing).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/setMissing');
            expect(response.status).toBe(404);
            expect(handleSetMissing).not.toHaveBeenCalled();
        });
    });

    describe('request /rename', () => {
        (handleRename as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/rename');
            expect(response.status).toBe(200);
            expect(handleRename).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/rename');
            expect(response.status).toBe(404);
            expect(handleRename).not.toHaveBeenCalled();
        });
    });

    describe('request /renameGroup', () => {
        (handleRenameGroup as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/renameGroup');
            expect(response.status).toBe(200);
            expect(handleRenameGroup).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/renameGroup');
            expect(response.status).toBe(404);
            expect(handleRenameGroup).not.toHaveBeenCalled();
        });
    });

    describe('request /remove', () => {
        (handleRemove as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/remove');
            expect(response.status).toBe(200);
            expect(handleRemove).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/remove');
            expect(response.status).toBe(404);
            expect(handleRemove).not.toHaveBeenCalled();
        });
    });

    describe('request /removeGroup', () => {
        (handleRemoveGroup as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/removeGroup');
            expect(response.status).toBe(200);
            expect(handleRemoveGroup).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/removeGroup');
            expect(response.status).toBe(404);
            expect(handleRemoveGroup).not.toHaveBeenCalled();
        });
    });

    describe('request /move', () => {
        (handleMove as jest.Mock).mockImplementation(handler);

        it('responds to post', async () => {
            const response = await request(server).post('/move');
            expect(response.status).toBe(200);
            expect(handleMove).toHaveBeenCalled();
        });

        it('does not RESPOND TO GET', async () => {
            const response = await request(server).get('/move');
            expect(response.status).toBe(404);
            expect(handleMove).not.toHaveBeenCalled();
        });
    });

    describe('request /*', () => {
        it('does not respond to GET', async () => {
            const response = await request(server).get('/other');
            expect(response.status).toBe(404);
        });

        it('does not respond to POST', async () => {
            const response = await request(server).post('/other');
            expect(response.status).toBe(404);
        });
    });
});
