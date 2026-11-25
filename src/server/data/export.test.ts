import fs from 'node:fs/promises';
import path from 'node:path';

/** @vitest-environment node */
import JSZip from 'jszip';
import { ClientSession } from 'mongodb';

import { buildExportArchive, exportEverything } from '~/server/data/export';
import { IMAGES_DIR } from '~/server/data/images';
import { db } from '~/server/db';

const transactionSession = Object.create(ClientSession.prototype) as ClientSession;

const collections = vi.hoisted(() => new Map<string, object[]>());

vi.mock(import('~/server/db'), () => ({
    db: vi.fn(async () => ({
        collection: (name: string) => ({
            insertMany: async (documents: object[]) => {
                collections.set(name, [...(collections.get(name) ?? []), ...structuredClone(documents)]);
                return { insertedCount: documents.length };
            },
            deleteMany: async () => {
                collections.delete(name);
                return { deletedCount: 0 };
            },
            find: () => ({ toArray: async () => structuredClone(collections.get(name) ?? []) }),
        }),
    })),
}));

const writtenPaths: string[] = [];

async function writeTestImage(relativePath: string, content: string): Promise<void> {
    const filePath = path.join(IMAGES_DIR, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(content));
    writtenPaths.push(filePath);
}

describe('catalog export', () => {
    afterEach(async () => {
        await (await db()).collection('products').deleteMany({});
        await (await db()).collection('groups').deleteMany({});
        await (await db()).collection('variants').deleteMany({});
        await Promise.all(writtenPaths.map((filePath) => fs.rm(filePath, { force: true }).catch(() => undefined)));
        writtenPaths.length = 0;
    });

    describe('exportEverything', () => {
        it('retrieves all products, groups, and variants', async () => {
            const products = [{ group: 'Produce', name: 'Carrots' }];
            const groups = [{ group: 'Produce', order: 0 }];
            const variants = [{ group: 'Produce', variant: 'kg', order: 0 }];
            collections.set('products', products);
            collections.set('groups', groups);
            collections.set('variants', variants);

            const result = await exportEverything(transactionSession);

            expect(result.products).toStrictEqual(products);
            expect(result.groups).toStrictEqual(groups);
            expect(result.variants).toStrictEqual(variants);
        });

        it('handles an empty database', async () => {
            const result = await exportEverything(transactionSession);

            expect(result.products).toStrictEqual([]);
            expect(result.groups).toStrictEqual([]);
            expect(result.variants).toStrictEqual([]);
        });
    });

    describe('buildExportArchive', () => {
        it('bundles data.json with products, groups, and variants', async () => {
            await (
                await db()
            )
                .collection('products')
                .insertMany([{ group: 'Daržovės', name: 'Morkos' }], { forceServerObjectId: true });
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

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);
            const data = JSON.parse(await zip.file('data.json')!.async('string'));

            expect(data).toStrictEqual({
                products: [{ group: 'Daržovės', name: 'Morkos' }],
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
                        name: 'Morkos',
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

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);

            await expect(zip.file('images/ab/cd/product.png')!.async('string')).resolves.toBe('product-bytes');
            await expect(zip.file('images/ef/00/variant.png')!.async('string')).resolves.toBe('variant-bytes');
            await expect(zip.file('images/11/22/group.png')!.async('string')).resolves.toBe('group-bytes');
        });

        it('bundles both the thumbnail and the original photo when both are set', async () => {
            await writeTestImage('ab/cd/thumb.png', 'thumb-bytes');
            await writeTestImage('ef/00/photo.png', 'photo-bytes');

            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        image: '/images/ab/cd/thumb.png',
                        photo: '/images/ef/00/photo.png',
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);

            await expect(zip.file('images/ab/cd/thumb.png')!.async('string')).resolves.toBe('thumb-bytes');
            await expect(zip.file('images/ef/00/photo.png')!.async('string')).resolves.toBe('photo-bytes');
        });

        it('does not add an entry for an image url with a missing file', async () => {
            await (
                await db()
            )
                .collection('products')
                .insertMany([{ group: 'Daržovės', name: 'Morkos', image: '/images/aa/bb/missing.png' }], {
                    forceServerObjectId: true,
                });

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);

            expect(zip.file('images/aa/bb/missing.png')).toBeNull();
        });

        it('skips a falsy variantImages entry without crashing', async () => {
            await writeTestImage('ab/cd/product.png', 'product-bytes');

            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        variantImages: { p: '/images/ab/cd/product.png', d: undefined },
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);

            await expect(zip.file('images/ab/cd/product.png')!.async('string')).resolves.toBe('product-bytes');
        });

        it('does not add an entry for an externally-hosted image url', async () => {
            await (
                await db()
            )
                .collection('products')
                .insertMany([{ group: 'Daržovės', name: 'Morkos', image: 'https://example.com/photo.png' }], {
                    forceServerObjectId: true,
                });

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);

            expect(Object.keys(zip.files).filter((f) => f.startsWith('images/'))).toHaveLength(0);
        });

        it('does not duplicate an image referenced by multiple products', async () => {
            await writeTestImage('ab/cd/shared.png', 'shared-bytes');

            await (await db()).collection('products').insertMany(
                [
                    { group: 'Daržovės', name: 'Morkos', image: '/images/ab/cd/shared.png' },
                    { group: 'Daržovės', name: 'Kopūstai', image: '/images/ab/cd/shared.png' },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const zip = await JSZip.loadAsync(buffer);

            expect(Object.keys(zip.files).filter((f) => f === 'images/ab/cd/shared.png')).toHaveLength(1);
        });
    });
});
