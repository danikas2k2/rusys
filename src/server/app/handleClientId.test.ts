import { type Request, type Response } from 'express';
import { handleClientId } from '~/server/app/handleClientId';
import { mockEnv } from '~/tests/mockEnv';

jest.mock('~/server/app/debug');

describe('handleClientId', () => {
    const request = {} as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    mockEnv();

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.GOOGLE_CLIENT_ID;
    });

    it('returns clientId when GOOGLE_CLIENT_ID is set', async () => {
        process.env.GOOGLE_CLIENT_ID = 'testClientId';
        await handleClientId(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: true,
            clientId: 'testClientId',
        });
    });

    it('returns error when GOOGLE_CLIENT_ID is not set', async () => {
        await handleClientId(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
        });
    });
});
