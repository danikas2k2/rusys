import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { getSessionProfile } from '~/server/auth/session';
import type { GET } from './route';

vi.mock(import('~/server/auth/session'), () => ({ getSessionProfile: vi.fn() }));

let imagesDir: string;
let route: { GET: typeof GET };

async function get(parts: string[]) {
    return route.GET(new Request('http://localhost/images/test.png'), { params: Promise.resolve({ path: parts }) });
}

describe('stored image route', () => {
    beforeAll(async () => {
        vi.mocked(getSessionProfile).mockResolvedValue({ sub: 'test-user' });
        imagesDir = await mkdtemp(path.join(os.tmpdir(), 'rusys-route-images-'));
        vi.stubEnv('IMAGES_DIR', imagesDir);
        vi.resetModules();
        route = await import('./route');
        await mkdir(path.join(imagesDir, 'ab'), { recursive: true });
        await writeFile(path.join(imagesDir, 'ab', 'icon.png'), Buffer.from('png bytes'));
        await writeFile(path.join(imagesDir, 'ab', 'archive.bin'), Buffer.from('binary bytes'));
    });

    afterAll(async () => {
        vi.unstubAllEnvs();
        await rm(imagesDir, { recursive: true, force: true });
    });

    it('serves a local image with its content type and cache policy', async () => {
        const response = await get(['ab', 'icon.png']);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/png');
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(Buffer.from(await response.arrayBuffer())).toStrictEqual(Buffer.from('png bytes'));
    });

    it('uses a binary content type when the extension is unknown', async () => {
        const response = await get(['ab', 'archive.bin']);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
    });

    it('rejects missing files and paths outside the image directory', async () => {
        expect((await get(['ab', 'missing.png'])).status).toBe(404);
        expect((await get([])).status).toBe(404);
        expect((await get(['..', 'secret.png'])).status).toBe(404);
        expect((await get(['.'])).status).toBe(404);
        expect((await get(['a\\b'])).status).toBe(404);
        expect((await get(['/outside.png'])).status).toBe(404);
    });

    it('does not serve images without a session', async () => {
        vi.mocked(getSessionProfile).mockResolvedValueOnce(undefined);

        expect((await get(['ab', 'icon.png'])).status).toBe(401);
    });
});
