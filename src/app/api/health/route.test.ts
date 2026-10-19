import { GET } from './route';

describe('health route', () => {
    it('reports liveness without HTTP caching', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/json');
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toStrictEqual({ status: 'ok' });
    });
});
