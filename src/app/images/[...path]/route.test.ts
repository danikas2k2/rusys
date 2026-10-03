import { mkdir, mkdtemp, readdir, rm, stat, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

import { getSessionProfile } from '~/server/auth/session';
import type { GET } from './route';

vi.mock(import('~/server/auth/session'), () => ({ getSessionProfile: vi.fn() }));

let imagesDir: string;
let route: { GET: typeof GET };

async function get(parts: string[], headers?: HeadersInit, query = '') {
    return route.GET(new Request(`http://localhost/images/test.png${query}`, { headers }), {
        params: Promise.resolve({ path: parts }),
    });
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
        await writeFile(
            path.join(imagesDir, 'ab', 'photo.png'),
            await sharp({ create: { width: 800, height: 400, channels: 3, background: 'red' } })
                .png()
                .toBuffer()
        );
    });

    afterAll(async () => {
        vi.unstubAllEnvs();
        await rm(imagesDir, { recursive: true, force: true });
    });

    it('serves a local image with its content type and cache policy', async () => {
        const response = await get(['ab', 'icon.png']);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/png');
        expect(response.headers.get('Cache-Control')).toBe('private, no-cache');
        expect(response.headers.get('ETag')).toMatch(/^W\/"[0-9a-f]+-[0-9a-f]+"$/);
        expect(response.headers.get('Last-Modified')).not.toBeNull();
        expect(response.headers.get('Vary')).toBe('Cookie');
        expect(Buffer.from(await response.arrayBuffer())).toStrictEqual(Buffer.from('png bytes'));
    });

    it('returns 304 without image bytes when the cached file is unchanged', async () => {
        const first = await get(['ab', 'icon.png']);
        const etag = first.headers.get('ETag')!;
        const response = await get(['ab', 'icon.png'], { 'If-None-Match': etag });

        expect(response.status).toBe(304);
        expect(response.headers.get('ETag')).toBe(etag);
        expect(response.headers.get('Cache-Control')).toBe('private, no-cache');
        await expect(response.arrayBuffer()).resolves.toHaveProperty('byteLength', 0);
    });

    it('sends the new image after an import overwrites the same URL', async () => {
        const filePath = path.join(imagesDir, 'ab', 'icon.png');
        const first = await get(['ab', 'icon.png']);
        const previous = await stat(filePath);
        await writeFile(filePath, Buffer.from('new bytes'));
        const updatedAt = new Date(previous.mtimeMs + 1000);
        await utimes(filePath, updatedAt, updatedAt);

        const response = await get(['ab', 'icon.png'], { 'If-None-Match': first.headers.get('ETag')! });

        expect(response.status).toBe(200);
        expect(response.headers.get('ETag')).not.toBe(first.headers.get('ETag'));
        expect(response.headers.get('Last-Modified')).not.toBe(first.headers.get('Last-Modified'));
        expect(Buffer.from(await response.arrayBuffer())).toStrictEqual(Buffer.from('new bytes'));
    });

    it('uses a binary content type when the extension is unknown', async () => {
        const response = await get(['ab', 'archive.bin']);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
    });

    it('resizes into requested bounds without changing aspect ratio or enlarging the source', async () => {
        const response = await get(['ab', 'photo.png'], undefined, '?w=200&h=200');

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/png');
        await expect(sharp(Buffer.from(await response.arrayBuffer())).metadata()).resolves.toMatchObject({
            width: 200,
            height: 100,
        });

        const heightOnly = await get(['ab', 'photo.png'], undefined, '?h=100');

        await expect(sharp(Buffer.from(await heightOnly.arrayBuffer())).metadata()).resolves.toMatchObject({
            width: 200,
            height: 100,
        });

        const oversized = await get(['ab', 'photo.png'], undefined, '?w=2048');

        await expect(sharp(Buffer.from(await oversized.arrayBuffer())).metadata()).resolves.toMatchObject({
            width: 800,
            height: 400,
        });
    });

    it('caches a variant and creates a fresh one when the source changes', async () => {
        const filePath = path.join(imagesDir, 'ab', 'photo.png');
        const first = await get(['ab', 'photo.png'], undefined, '?w=160');
        const firstBytes = Buffer.from(await first.arrayBuffer());
        const cacheRoot = path.join(imagesDir, '.variants');
        const [sourceDir] = await readdir(cacheRoot);
        const cacheDir = path.join(cacheRoot, sourceDir);
        const [cachedFile] = (await readdir(cacheDir)).filter((name) => name.endsWith('-160-0.png'));

        expect(cachedFile).toBeDefined();

        const cachePath = path.join(cacheDir, cachedFile);
        const cachedStats = await stat(cachePath);

        const second = await get(['ab', 'photo.png'], undefined, '?w=160');

        expect(Buffer.from(await second.arrayBuffer())).toStrictEqual(firstBytes);
        expect((await stat(cachePath)).mtimeNs).toBe(cachedStats.mtimeNs);
        expect(second.headers.get('ETag')).toBe(first.headers.get('ETag'));

        await writeFile(
            filePath,
            await sharp({ create: { width: 400, height: 400, channels: 3, background: 'blue' } })
                .png()
                .toBuffer()
        );
        const updatedAt = new Date((await stat(filePath)).mtimeMs + 1000);
        await utimes(filePath, updatedAt, updatedAt);

        const updated = await get(['ab', 'photo.png'], { 'If-None-Match': first.headers.get('ETag')! }, '?w=160');

        expect(updated.status).toBe(200);
        expect(updated.headers.get('ETag')).not.toBe(first.headers.get('ETag'));
        await expect(sharp(Buffer.from(await updated.arrayBuffer())).metadata()).resolves.toMatchObject({
            width: 160,
            height: 160,
        });
    });

    it('returns 304 for a matching resized variant after checking the session', async () => {
        const first = await get(['ab', 'photo.png'], undefined, '?w=100');
        const response = await get(['ab', 'photo.png'], { 'If-None-Match': first.headers.get('ETag')! }, '?w=100');

        expect(response.status).toBe(304);
        expect(response.headers.get('Cache-Control')).toBe('private, no-cache');
    });

    it('rejects invalid dimensions and unsupported formats', async () => {
        for (const query of ['?w=0', '?w=-1', '?w=2049', '?w=abc', '?w=1.5', '?w=20&w=40', '?h=999999']) {
            expect((await get(['ab', 'photo.png'], undefined, query)).status).toBe(400);
        }

        expect((await get(['ab', 'archive.bin'], undefined, '?w=100')).status).toBe(415);
        expect((await get(['.variants', 'private.png'])).status).toBe(404);
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

        const response = await get(['ab', 'icon.png'], { 'If-None-Match': '*' });

        expect(response.status).toBe(401);
        expect(response.headers.get('Cache-Control')).toBeNull();
    });
});
