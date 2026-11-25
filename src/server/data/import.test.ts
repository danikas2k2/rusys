import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import JSZip from 'jszip';

import { IMAGES_DIR } from '~/server/data/images';
import { readImportArchive, writeImportImages } from '~/server/data/import';

const writtenPaths: string[] = [];

describe('catalog import', () => {
    afterEach(async () => {
        await Promise.all(writtenPaths.map((filePath) => fs.rm(filePath, { force: true }).catch(() => undefined)));
        writtenPaths.length = 0;
    });

    describe('readImportArchive', () => {
        it('parses data.json and returns valid sharded image entries', async () => {
            const uid = 'a'.repeat(32);
            const zip = new JSZip();
            zip.file('data.json', JSON.stringify({ products: [], groups: [], variants: [] }));
            zip.file(`images/ab/cd/${uid}.png`, 'image-bytes');
            const buffer = await zip.generateAsync({ type: 'nodebuffer' });

            const result = await readImportArchive(buffer);

            expect(result.data).toStrictEqual({ products: [], groups: [], variants: [] });
            expect(result.images).toStrictEqual([
                { relativePath: `ab/cd/${uid}.png`, content: Buffer.from('image-bytes') },
            ]);
        });

        it('ignores entries that do not match the sharded image path pattern', async () => {
            const zip = new JSZip();
            zip.file('data.json', JSON.stringify({ products: [], groups: [], variants: [] }));
            zip.file('images/../../etc/passwd', 'malicious');
            zip.file('images/not-sharded.png', 'malicious');
            zip.file('readme.txt', 'not an image');
            const buffer = await zip.generateAsync({ type: 'nodebuffer' });

            const result = await readImportArchive(buffer);

            expect(result.images).toStrictEqual([]);
        });

        it('enforces a shared decoded size limit across data and image entries', async () => {
            const zip = new JSZip();
            const data = JSON.stringify({ products: [], groups: [], variants: [] });
            zip.file('data.json', data);
            zip.file('images/ab/cd/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png', 'test image');
            const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

            await expect(readImportArchive(buffer, Buffer.byteLength(data) + 5)).rejects.toThrow('import size limit');
        });

        it('throws when data.json is missing', async () => {
            const zip = new JSZip();
            zip.file('images/ab/cd/whatever.png', 'x');
            const buffer = await zip.generateAsync({ type: 'nodebuffer' });

            await expect(readImportArchive(buffer)).rejects.toThrow('Archive is missing data.json');
        });

        it('throws when the archive is not a valid zip', async () => {
            await expect(readImportArchive(Buffer.from('not a zip'))).rejects.toThrow(/.+/);
        });
    });

    describe('writeImportImages', () => {
        it('writes images to their sharded on-disk paths', async () => {
            const uid = 'b'.repeat(32);
            await writeImportImages([{ relativePath: `ab/cd/${uid}.png`, content: Buffer.from('written-bytes') }]);
            writtenPaths.push(path.join(IMAGES_DIR, 'ab', 'cd', `${uid}.png`));

            const contents = await fs.readFile(path.join(IMAGES_DIR, 'ab', 'cd', `${uid}.png`));

            expect(contents.toString()).toBe('written-bytes');
        });

        it('removes a published file when publishing a later file fails', async () => {
            const images = [randomUUID(), randomUUID()].map((uid) => ({
                relativePath: `ab/cd/${uid.replaceAll('-', '')}.png`,
                content: Buffer.from(uid),
            }));
            const paths = images.map(({ relativePath }) => path.join(IMAGES_DIR, relativePath));
            writtenPaths.push(...paths);
            const realLink = fs.link;
            const link = vi
                .spyOn(fs, 'link')
                .mockImplementationOnce(realLink)
                .mockRejectedValueOnce(new Error('disk error'));
            try {
                await expect(writeImportImages(images)).rejects.toThrow('disk error');
                expect(link).toHaveBeenCalledTimes(2);
                await expect(fs.access(paths[0])).rejects.toMatchObject({ code: 'ENOENT' });
                await expect(fs.access(paths[1])).rejects.toMatchObject({ code: 'ENOENT' });
            } finally {
                link.mockRestore();
            }
        });

        it('does nothing for an empty list', async () => {
            await expect(writeImportImages([])).resolves.toBeUndefined();
        });
    });
});
