import { type Request, type Response } from 'express';
import { handleCheckUser } from '~/server/app/handleCheckUser';
import { mockEnv } from '~/tests/mockEnv';

jest.mock('~/server/app/debug');

describe('handleCheckUser', () => {
    const response = { json: jest.fn() } as unknown as Response;

    mockEnv();

    afterEach(() => jest.clearAllMocks());

    it('returns allowed user when email is in GOOGLE_ALLOWED_USERS', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        const request = { body: { email: 'test@example.com' } } as unknown as Request;

        await handleCheckUser(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: true,
            email: 'test@example.com',
            allowed: true,
        });
    });

    it('returns not allowed user when email is not in GOOGLE_ALLOWED_USERS', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        const request = { body: { email: 'other@example.com' } } as unknown as Request;

        await handleCheckUser(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: true,
            email: 'other@example.com',
            allowed: false,
        });
    });

    it('returns allowed user when DEV_MODE is enabled', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        process.env.DEV_MODE = 'true';
        const request = { body: { email: 'other@example.com' } } as unknown as Request;

        await handleCheckUser(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: true,
            email: 'other@example.com',
            allowed: true,
        });
    });

    it('returns error when no email requested', async () => {
        process.env.GOOGLE_ALLOWED_USERS = 'test@example.com';
        const request = { body: {} } as unknown as Request;

        await handleCheckUser(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            allowed: false,
        });
    });
});
