/** @vitest-environment node */
import fs from 'node:fs/promises';
import path from 'node:path';

import { deleteImage, IMAGES_DIR, saveImage } from '~/server/data/images';

describe('images', () => {
    const savedUrls: string[] = [];

    afterEach(async () => {
        await Promise.all(savedUrls.map((url) => deleteImage(url)));
        savedUrls.length = 0;
    });

    describe('saveImage', () => {
        it('writes a png file and returns a sharded /images url', async () => {
            const dataUrl = `data:image/png;base64,${Buffer.from('png-bytes').toString('base64')}`;

            const url = await saveImage(dataUrl);
            savedUrls.push(url);

            expect(url).toMatch(/^\/images\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32}\.png$/);

            const contents = await fs.readFile(path.join(IMAGES_DIR, url.slice('/images/'.length)));

            expect(contents.toString()).toBe('png-bytes');
        });

        it('writes a jpeg file with the .jpg extension', async () => {
            const dataUrl = `data:image/jpeg;base64,${Buffer.from('jpeg-bytes').toString('base64')}`;

            const url = await saveImage(dataUrl);
            savedUrls.push(url);

            expect(url).toMatch(/\.jpg$/);
        });

        it('writes a gif file with the .gif extension', async () => {
            const dataUrl = `data:image/gif;base64,${Buffer.from('gif-bytes').toString('base64')}`;

            const url = await saveImage(dataUrl);
            savedUrls.push(url);

            expect(url).toMatch(/\.gif$/);
        });

        it('writes a webp file with the .webp extension', async () => {
            const dataUrl = `data:image/webp;base64,${Buffer.from('webp-bytes').toString('base64')}`;

            const url = await saveImage(dataUrl);
            savedUrls.push(url);

            expect(url).toMatch(/\.webp$/);
        });

        it('rejects an unsupported mime type', async () => {
            const dataUrl = `data:image/svg+xml;base64,${Buffer.from('<svg/>').toString('base64')}`;

            await expect(saveImage(dataUrl)).rejects.toThrow('Unsupported image type');
        });

        it('rejects a non-data-url string', async () => {
            await expect(saveImage('not-a-data-url')).rejects.toThrow('Unsupported image type');
        });
    });

    describe('deleteImage', () => {
        it('deletes a previously saved image', async () => {
            const dataUrl = `data:image/png;base64,${Buffer.from('to-delete').toString('base64')}`;
            const url = await saveImage(dataUrl);

            await deleteImage(url);

            await expect(fs.access(path.join(IMAGES_DIR, url.slice('/images/'.length)))).rejects.toThrow(/ENOENT/);
        });

        it('does nothing for a data url', async () => {
            await expect(
                deleteImage(`data:image/png;base64,${Buffer.from('x').toString('base64')}`)
            ).resolves.toBeUndefined();
        });

        it('does nothing for undefined', async () => {
            await expect(deleteImage(undefined)).resolves.toBeUndefined();
        });

        it('does nothing for a missing file', async () => {
            await expect(deleteImage('/images/aa/bb/aabbccddeeff00112233445566778899.png')).resolves.toBeUndefined();
        });

        it('removes the now-empty shard directory after deleting the file', async () => {
            const dataUrl = `data:image/png;base64,${Buffer.from('to-delete').toString('base64')}`;
            const url = await saveImage(dataUrl);
            const relativePath = url.slice('/images/'.length);
            const [shard1, shard2] = relativePath.split('/');

            await deleteImage(url);

            // The leaf (256*256-way sharded) directory is deleted; the outer, more heavily
            // shared xx directory is left alone since concurrent tests may still use it.
            await expect(fs.access(path.join(IMAGES_DIR, shard1!, shard2!))).rejects.toThrow(/ENOENT/);
        });

        it('keeps shard directories that still contain other files', async () => {
            const dataUrl = `data:image/png;base64,${Buffer.from('to-delete').toString('base64')}`;
            const url = await saveImage(dataUrl);
            const relativePath = url.slice('/images/'.length);
            const [shard1, shard2] = relativePath.split('/');
            const shardDir = path.join(IMAGES_DIR, shard1!, shard2!);
            const otherFilePath = path.join(shardDir, 'other.png');
            await fs.writeFile(otherFilePath, Buffer.from('other-bytes'));

            await deleteImage(url);

            await expect(fs.access(otherFilePath)).resolves.toBeUndefined();

            await fs.rm(shardDir, { recursive: true, force: true });
        });
    });
});
