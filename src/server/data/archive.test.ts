import fs from 'node:fs/promises';
import path from 'node:path';

/** @vitest-environment node */
import { ClientSession } from 'mongodb';

import { serializedArchiveDataSchema } from '~/schema';
import { buildExportArchive, exportEverything } from '~/server/data/export';
import { IMAGES_DIR } from '~/server/data/images';
import { readImportArchive } from '~/server/data/import';
import { db } from '~/server/db';

const transactionSession = Object.create(ClientSession.prototype) as ClientSession;

vi.mock(import('~/server/db'));

const writtenPaths: string[] = [];

async function writeTestImage(relativePath: string, content: string): Promise<void> {
    const filePath = path.join(IMAGES_DIR, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(content));
    writtenPaths.push(filePath);
}

describe('catalog archive compatibility', () => {
    afterEach(async () => {
        await (await db()).collection('products').deleteMany({});
        await (await db()).collection('groups').deleteMany({});
        await (await db()).collection('variants').deleteMany({});
        await Promise.all(writtenPaths.map((filePath) => fs.rm(filePath, { force: true }).catch(() => undefined)));
        writtenPaths.length = 0;
    });

    describe('round trip', () => {
        it('the real schema accepts a product with image and variantImages fields', async () => {
            await writeTestImage('ac/dd/compat-product.png', 'product-bytes');
            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        image: '/images/ac/dd/compat-product.png',
                        variantImages: { p: '/images/ac/dd/compat-product.png' },
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const { data } = await readImportArchive(buffer);

            expect(() => serializedArchiveDataSchema.parse(data)).not.toThrow();
        });

        it('the real schema accepts a product with image, photo, and variantPhotos fields', async () => {
            await writeTestImage('ac/dd/compat-thumb.png', 'thumb-bytes');
            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        image: '/images/ac/dd/compat-thumb.png',
                        photo: '/images/ec/dd/compat-photo.png',
                        variantImages: { p: '/images/ac/dd/compat-thumb.png' },
                        variantPhotos: { p: '/images/ec/dd/compat-photo.png' },
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const { data } = await readImportArchive(buffer);

            expect(() => serializedArchiveDataSchema.parse(data)).not.toThrow();
        });

        it('the real schema accepts updates/undates amounts with suspicious, home, and expiresAt flags', async () => {
            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        updates: [
                            {
                                time: Date.now(),
                                years: [
                                    {
                                        year: 22,
                                        amounts: [
                                            { variant: 'p', amount: -1, recycled: false, suspicious: true },
                                            { variant: 'p', amount: -1, recycled: false, home: true },
                                            { variant: 'p', amount: -1, recycled: false, expiresAt: Date.now() },
                                        ],
                                    },
                                ],
                            },
                        ],
                        undates: [
                            {
                                time: Date.now(),
                                years: [{ year: 22, amounts: [{ variant: 'p', amount: 1, suspicious: true }] }],
                            },
                        ],
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const { data } = await readImportArchive(buffer);

            expect(() => serializedArchiveDataSchema.parse(data)).not.toThrow();
        });

        it('the real schema accepts explicit null suspicious/home/expiresAt left by an older app version', async () => {
            await (await db()).collection('products').insertMany(
                [
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        updates: [
                            {
                                time: Date.now(),
                                years: [
                                    {
                                        year: 22,
                                        amounts: [
                                            {
                                                variant: 'p',
                                                amount: -1,
                                                recycled: true,
                                                suspicious: null,
                                                home: null,
                                                expiresAt: null,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const { data } = await readImportArchive(buffer);

            expect(() => serializedArchiveDataSchema.parse(data)).not.toThrow();
        });

        it('the real schema accepts a sub-product with a parent field', async () => {
            await (await db()).collection('products').insertMany(
                [
                    { group: 'Daržovės', name: 'Morkos' },
                    { group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' },
                ],
                { forceServerObjectId: true }
            );

            const buffer = await buildExportArchive(await exportEverything(transactionSession));
            const { data } = await readImportArchive(buffer);

            expect(() => serializedArchiveDataSchema.parse(data)).not.toThrow();
        });
    });
});
