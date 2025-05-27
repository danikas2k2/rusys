import { mockEnv } from '@tests/mockEnv';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { DEV_CLIENT_ID, handleClientId } from '~/server/api/handleClientId';
import { type ApiClientId } from '~/types/api';

jest.mock('~/server/api/debug');

describe('handleClientId', () => {
    const request = mockRequest();
    const response = mockResponse<ApiClientId>();

    mockEnv();

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.GOOGLE_CLIENT_ID;
    });

    it('returns clientId when GOOGLE_CLIENT_ID is set', async () => {
        process.env.GOOGLE_CLIENT_ID = 'TEST_CLIENT_ID';
        await handleClientId(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, clientId: 'TEST_CLIENT_ID' });
    });

    it('returns error when GOOGLE_CLIENT_ID is not set', async () => {
        process.env.NODE_ENV = 'production';
        await handleClientId(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns special clientId on development environment when GOOGLE_CLIENT_ID is not set', async () => {
        process.env.NODE_ENV = 'development';
        await handleClientId(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, clientId: DEV_CLIENT_ID });
    });
});
