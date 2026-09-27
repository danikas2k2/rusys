import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutUserProfile } from '~/server/api/v1/users/handlePutUserProfile';
import { upsertUserProfile } from '~/server/data/userProfiles';

vi.mock(import('~/server/data/userProfiles'), () => ({ upsertUserProfile: vi.fn() }));

async function put(body: unknown, email = 'user@example.com') {
    const request = new NextRequest('http://localhost/api/v1/user-profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePutUserProfile, { email });
}

describe('handlePutUserProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(upsertUserProfile).mockResolvedValue(true);
    });

    it('requires an email and validates optional fields', async () => {
        expect((await put({}, '')).status).toBe(400);
        expect((await put({ picture: 123 })).status).toBe(400);
        expect(upsertUserProfile).not.toHaveBeenCalled();
    });

    it('passes the profile to storage and permits omitted fields', async () => {
        expect((await put({ name: 'Jonas', picture: '/photo.png' })).status).toBe(204);
        expect(upsertUserProfile).toHaveBeenCalledWith('user@example.com', 'Jonas', '/photo.png');
        expect((await put({})).status).toBe(204);
        expect(upsertUserProfile).toHaveBeenLastCalledWith('user@example.com', undefined, undefined);
    });

    it('reports a rejected profile update', async () => {
        vi.mocked(upsertUserProfile).mockResolvedValueOnce(false);

        expect((await put({ name: 'Jonas' })).status).toBe(422);
    });
});
