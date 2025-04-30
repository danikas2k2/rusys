import { mockEnv } from '@tests/mockEnv';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiUserAllowed, type ApiUserEmail } from '~/common/api';
import { handleCheckUser } from '~/server/app/handleCheckUser';

jest.mock('~/server/app/debug');

describe('handleCheckUser', () => {
    const response = mockResponse<ApiUserAllowed>();

    mockEnv();

    beforeEach(() => {
        process.env.GOOGLE_ALLOWED_USERS = undefined;
        process.env.NODE_ENV = 'production';
    });

    afterEach(() => jest.clearAllMocks());

    it('returns allowed user when email is in GOOGLE_ALLOWED_USERS', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        const request = mockRequest<ApiUserEmail>({ email: 'test@example.com' });

        await handleCheckUser(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, allowed: true });
    });

    it('returns not allowed user when email is not in GOOGLE_ALLOWED_USERS', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        const request = mockRequest<ApiUserEmail>({ email: 'other@example.com' });

        await handleCheckUser(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns allowed user when dev mode is enabled', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        process.env.NODE_ENV = 'development';
        const request = mockRequest<ApiUserEmail>({ email: 'other@example.com' });

        await handleCheckUser(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, allowed: true });
    });

    it('returns error when no email requested', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        const request = mockRequest<ApiUserEmail>();

        await handleCheckUser(request, response);

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });
});
