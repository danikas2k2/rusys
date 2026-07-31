/** @vitest-environment node */
import fs from 'node:fs/promises';
import path from 'node:path';

import JSZip from 'jszip';

import { buildExportArchive, readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { IMAGES_DIR } from '~/server/data/images';
import { getValidator } from '~/server/data/schema/getValidator';
import { db } from '~/server/db';

vi.mock(import('~/server/db'));

const writtenPaths: string[] = [];

async function writeTestImage(relativePath: string, content: string): Promise<void> {
    const filePath = path.join(IMAGES_DIR, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(content));
    writtenPaths.push(filePath);
}

describe('exportArchive', () => {
    afterEach(async () => {
        await (await db()).collection('products').deleteMany({});
        await (await db()).collection('groups').deleteMany({});
        await (await db()).collection('variants').deleteMany({});
        await Promise.all(writtenPaths.map((filePath) => fs.rm(filePath, { force: true }).catch(() => undefined)));
        writtenPaths.length = 0;
    });

    describe('buildExportArchive', () => {
        it('bundles data.json with products, groups, and variants', async () => {
            await (
                await db()
            )
                .collection('products')
                .insertMany([{ group: 'Daržovės', name: 'Agurkai' }], { forceServerObjectId: true });
            await (
                await db()
            )
                .collection('groups')
                .insertMany([{ group: 'Daržovės', order: 0 }], { forceServerObjectId: true });
            await (
                await db()
            )
                .collection('variants')
                .insertMany([{ group: 'Daržovės', variant: 'p', order: 0 }], { forceServerObjectId: true });

            const buffer = await buildExportArchive();
            const zip = await JSZip.loadAsync(buffer);
            const data = JSON.parse(await zip.file('data.json')!.async('string'));

            expect(data).toStrictEqual({
                products: [{ group: 'Daržovės', name: 'Agurkai' }],
                groups: [{ group: 'Daržovės', order: 0 }],
                variants: [{ group: 'Daržovės', variant: 'p', order: 0 }],
            });
        });

        it('includes the product image, variant images, and group image referenced in the data', async () => {
            await writeTestImage('ab/cd/product.png', 'product-bytes');
            await writeTestImage('ef/00/variant.png', 'variant-bytes');
            await writeTestImage('11/22/group.png', 'group-bytes');

            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Agurkai',
                        image: '/images/ab/cd/product.png',
                        variantImages: { p: '/images/ef/00/variant.png' },
                    },
                ],
                { forceServerObjectId: true }
            );
            await (
                await db()
            )
                .collection('groups')
                .insertMany([{ group: 'Daržovės', order: 0, image: '/images/11/22/group.png' }], {
                    forceServerObjectId: true,
                });

            const buffer = await buildExportArchive();
            const zip = await JSZip.loadAsync(buffer);

            await expect(zip.file('images/ab/cd/product.png')!.async('string')).resolves.toBe('product-bytes');
            await expect(zip.file('images/ef/00/variant.png')!.async('string')).resolves.toBe('variant-bytes');
            await expect(zip.file('images/11/22/group.png')!.async('string')).resolves.toBe('group-bytes');
        });

        it('does not add an entry for an image url with a missing file', async () => {
            await (
                await db()
            )
                .collection('products')
                .insertMany([{ group: 'Daržovės', name: 'Agurkai', image: '/images/aa/bb/missing.png' }], {
                    forceServerObjectId: true,
                });

            const buffer = await buildExportArchive();
            const zip = await JSZip.loadAsync(buffer);

            expect(zip.file('images/aa/bb/missing.png')).toBeNull();
        });

        it('does not duplicate an image referenced by multiple products', async () => {
            await writeTestImage('ab/cd/shared.png', 'shared-bytes');

            await (await db()).collection('products').insertMany(
                [
                    { group: 'Daržovės', name: 'Agurkai', image: '/images/ab/cd/shared.png' },
                    { group: 'Daržovės', name: 'Kopūstai', image: '/images/ab/cd/shared.png' },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive();
            const zip = await JSZip.loadAsync(buffer);

            expect(Object.keys(zip.files).filter((f) => f === 'images/ab/cd/shared.png')).toHaveLength(1);
        });
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

        it('does nothing for an empty list', async () => {
            await expect(writeImportImages([])).resolves.toBeUndefined();
        });
    });

    describe('round trip', () => {
        it('the real schema accepts a product with image and variantImages fields', async () => {
            await writeTestImage('ab/cd/product.png', 'product-bytes');
            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Agurkai',
                        image: '/images/ab/cd/product.png',
                        variantImages: { p: '/images/ab/cd/product.png' },
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive();
            const { data } = await readImportArchive(buffer);

            expect(getValidator()(data)).toBe(true);
        });
    });
});
