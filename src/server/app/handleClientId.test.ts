import { type ApiClientId } from '~/common/api';
import { handleClientId } from '~/server/app/handleClientId';
import { mockEnv } from '~/tests/mockEnv';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');

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
        await handleClientId(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
