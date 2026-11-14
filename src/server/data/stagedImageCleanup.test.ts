/** @vitest-environment node */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { cleanupStagedImages, STAGED_IMAGE_MAX_AGE_MS } from './stagedImageCleanup';

describe('staged image cleanup', () => {
    afterEach(() => vi.restoreAllMocks());

    it('treats an absent upload directory as empty', async () => {
        vi.spyOn(fs, 'readdir').mockRejectedValueOnce(Object.assign(new Error('missing'), { code: 'ENOENT' }));

        await expect(cleanupStagedImages('/missing')).resolves.toBeUndefined();
    });

    it('reports inaccessible directories instead of pretending cleanup succeeded', async () => {
        vi.spyOn(fs, 'readdir').mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'EACCES' }));

        await expect(cleanupStagedImages('/denied')).rejects.toThrow('denied');
    });

    it.each([
        { code: 'ENOENT', outcome: undefined },
        { code: 'EACCES', outcome: 'file changed' },
    ])('handles a file disappearing or becoming inaccessible during cleanup (%s)', async ({ code, outcome }) => {
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'staged-image-race-'));
        try {
            await fs.writeFile(path.join(directory, 'a'.repeat(64)), 'data');
            vi.spyOn(fs, 'lstat').mockRejectedValueOnce(Object.assign(new Error('file changed'), { code }));
            const cleaning = cleanupStagedImages(directory);

            await expect(cleaning.catch((error: Error) => error.message)).resolves.toBe(outcome);
        } finally {
            await fs.rm(directory, { recursive: true, force: true });
        }
    });

    it('never follows symlinks or recursively deletes upload directories', async () => {
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'staged-image-links-'));
        try {
            const target = path.join(directory, 'target');
            await fs.writeFile(target, 'keep');
            await fs.symlink(target, path.join(directory, 'a'.repeat(64)));
            await fs.mkdir(path.join(directory, 'b'.repeat(64)));
            await cleanupStagedImages(directory, Date.now() + STAGED_IMAGE_MAX_AGE_MS + 1000);

            await expect(fs.readFile(target, 'utf8')).resolves.toBe('keep');
            expect((await fs.lstat(path.join(directory, 'b'.repeat(64)))).isDirectory()).toBe(true);
        } finally {
            await fs.rm(directory, { recursive: true, force: true });
        }
    });

    it('removes only expired staged uploads', async () => {
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'staged-image-'));
        try {
            const old = path.join(directory, 'a'.repeat(64));
            const recent = path.join(directory, 'b'.repeat(64));
            const unrelated = path.join(directory, 'other');
            await Promise.all([old, recent, unrelated].map((filename) => fs.writeFile(filename, 'data')));
            const now = Date.now();
            await fs.utimes(
                old,
                new Date(now - STAGED_IMAGE_MAX_AGE_MS - 1000),
                new Date(now - STAGED_IMAGE_MAX_AGE_MS - 1000)
            );
            await cleanupStagedImages(directory, now);

            await expect(fs.access(old)).rejects.toMatchObject({ code: 'ENOENT' });
            await expect(fs.access(recent)).resolves.toBeUndefined();
            await expect(fs.access(unrelated)).resolves.toBeUndefined();
        } finally {
            await fs.rm(directory, { recursive: true, force: true });
        }
    });
});
