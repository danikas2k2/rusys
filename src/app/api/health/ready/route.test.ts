import { db } from '~/server/db';
import { GET } from './route';

const { collection, findOne } = vi.hoisted(() => {
    const findGroup = vi.fn();
    return { collection: vi.fn(() => ({ findOne: findGroup })), findOne: findGroup };
});

vi.mock(import('~/server/db'), () => ({
    db: vi.fn(async () => ({ collection })),
}));

describe('catalog readiness route', () => {
    afterEach(() => vi.clearAllMocks());

    it.each([null, { _id: 'group-id', group: 'private group name' }])(
        'reports readiness after a successful groups read (%j)',
        async (group) => {
            findOne.mockResolvedValueOnce(group);
            const response = await GET();

            expect(collection).toHaveBeenCalledExactlyOnceWith('groups');
            expect(findOne).toHaveBeenCalledExactlyOnceWith({}, { projection: { _id: 1 }, timeoutMS: 2000 });
            expect(response.status).toBe(200);
            expect(response.headers.get('Cache-Control')).toBe('no-store');
            await expect(response.json()).resolves.toStrictEqual({ status: 'ready' });
        }
    );

    it.each([
        { stage: 'connection', operation: vi.mocked(db) },
        { stage: 'read', operation: findOne },
    ])('returns an opaque 503 on $stage failure', async ({ operation }) => {
        operation.mockRejectedValueOnce(new Error('private database diagnostic'));

        const response = await GET();

        expect(response.status).toBe(503);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toStrictEqual({ status: 'unavailable' });
    });
});
