import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import JSZip from 'jszip';

import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import type { SerializedArchiveData } from '~/schema';
import { DATA_ENTRY, IMAGES_ENTRY_PREFIX } from '~/server/data/archive';
import { IMAGES_DIR, IMAGES_URL_PATH, shardedPath } from '~/server/data/images';
import { db } from '~/server/db';

const IMAGE_ENTRY_PATTERN = /^images\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32}\.[a-z0-9]+$/;

export interface ImportArchiveImage {
    relativePath: string;
    content: Buffer;
}

export interface ImportArchive {
    /** Untrusted decoded JSON; the import handler validates the legacy wire format before performing writes. */
    data: unknown;
    images: ImportArchiveImage[];
}

export async function readImportArchive(
    buffer: Buffer,
    maxDecodedBytes = MAX_IMPORT_FILE_SIZE
): Promise<ImportArchive> {
    let remainingBytes = maxDecodedBytes;
    function readEntry(entry: JSZip.JSZipObject): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            const stream = entry.nodeStream();
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('data', (chunk: Buffer) => {
                remainingBytes -= chunk.length;
                if (remainingBytes < 0) {
                    stream.pause();
                    reject(new Error('Decoded archive exceeds the import size limit'));
                    return;
                }
                chunks.push(chunk);
            });
        });
    }

    const zip = await JSZip.loadAsync(buffer);
    const dataEntry = zip.file(DATA_ENTRY);
    if (!dataEntry) {
        throw new Error(`Archive is missing ${DATA_ENTRY}`);
    }
    const data: unknown = JSON.parse((await readEntry(dataEntry)).toString('utf8'));

    const images: ImportArchiveImage[] = [];
    for (const [entryPath, entry] of Object.entries(zip.files)) {
        if (entry.dir || !IMAGE_ENTRY_PATTERN.test(entryPath)) {
            continue;
        }
        images.push({
            relativePath: entryPath.slice(IMAGES_ENTRY_PREFIX.length),
            content: await readEntry(entry),
        });
    }

    return { data, images };
}

/** Assigns archive images new paths so concurrent edits to the old catalog cannot remove them. */
export function prepareImportImages(
    data: SerializedArchiveData,
    images: readonly ImportArchiveImage[]
): { data: SerializedArchiveData; images: ImportArchiveImage[] } {
    const archived = new Map(
        images.map(({ relativePath, content }) => [`${IMAGES_URL_PATH}/${relativePath}`, { relativePath, content }])
    );
    const urls = new Map<string, string>();
    const restoredImages: ImportArchiveImage[] = [];

    function fromArchive(url: string): string {
        const previous = urls.get(url);
        if (previous) {
            return previous;
        }
        const image = archived.get(url);
        if (!image) {
            return url;
        }
        const uid = randomUUID().replaceAll('-', '');
        const newPath = shardedPath(uid, path.extname(image.relativePath).slice(1));
        const newUrl = `${IMAGES_URL_PATH}/${newPath}`;
        urls.set(url, newUrl);
        restoredImages.push({ relativePath: newPath, content: image.content });
        return newUrl;
    }

    const rewrite = <T extends { image?: string; photo?: string }>(record: T): T => ({
        ...record,
        ...(record.image ? { image: fromArchive(record.image) } : {}),
        ...(record.photo ? { photo: fromArchive(record.photo) } : {}),
    });
    const rewriteMap = (entries: Record<string, string>): Record<string, string> =>
        Object.fromEntries(Object.entries(entries).map(([key, url]) => [key, fromArchive(url)]));

    return {
        data: {
            ...data,
            groups: data.groups.map(rewrite),
            products: data.products.map((product) => ({
                ...rewrite(product),
                ...(product.variantImages ? { variantImages: rewriteMap(product.variantImages) } : {}),
                ...(product.variantPhotos ? { variantPhotos: rewriteMap(product.variantPhotos) } : {}),
            })),
        },
        images: restoredImages,
    };
}

async function hasMatchingImage(filePath: string, content: Buffer): Promise<boolean> {
    const existing = await fs.readFile(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') {
            throw error;
        }
        return undefined;
    });
    if (existing && !existing.equals(content)) {
        throw new Error('Imported image conflicts with an existing file');
    }
    return existing !== undefined;
}

export async function writeImportImages(images: readonly ImportArchiveImage[]): Promise<void> {
    const missing: { filePath: string; content: Buffer }[] = [];
    for (const { relativePath, content } of images) {
        const filePath = path.join(IMAGES_DIR, relativePath);
        if (!(await hasMatchingImage(filePath, content))) {
            missing.push({ filePath, content });
        }
    }
    if (!missing.length) {
        return;
    }

    await fs.mkdir(IMAGES_DIR, { recursive: true });
    const staging = await fs.mkdtemp(path.join(IMAGES_DIR, '.import-'));
    const published: string[] = [];
    try {
        for (const [index, { content }] of missing.entries()) {
            await fs.writeFile(path.join(staging, String(index)), content);
        }
        for (const [index, { filePath, content }] of missing.entries()) {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            // Publish only complete files and keep existing image URLs immutable.
            try {
                await fs.link(path.join(staging, String(index)), filePath);
                published.push(filePath);
            } catch (error) {
                if (
                    (error as NodeJS.ErrnoException).code !== 'EEXIST' ||
                    !(await hasMatchingImage(filePath, content))
                ) {
                    throw error;
                }
            }
        }
    } catch (error) {
        await Promise.allSettled(published.map((filePath) => fs.unlink(filePath)));
        throw error;
    } finally {
        await fs.rm(staging, { recursive: true, force: true });
    }
}

/** Atomically replaces the catalog while preserving other collections and existing indexes. */
export async function importEverything(
    { products, variants, groups }: SerializedArchiveData,
    restoreImages: () => Promise<void>
): Promise<void> {
    const database = await db();
    await database.client.withSession((session) =>
        session.withTransaction(
            async () => {
                // Make concurrent imports conflict even when the catalog is empty.
                await database
                    .collection<{ _id: string; revision: number }>('catalog_imports')
                    .updateOne({ _id: 'catalog' }, { $inc: { revision: 1 } }, { session, upsert: true });
                const catalog = [
                    { name: 'products', documents: products },
                    { name: 'variants', documents: variants },
                    { name: 'groups', documents: groups },
                ];
                for (const { name, documents } of catalog) {
                    const collection = database.collection(name);
                    await collection.deleteMany({}, { session });
                    if (documents.length) {
                        await collection.insertMany(documents, { session, ignoreUndefined: true });
                    }
                }
                await restoreImages();
            },
            { writeConcern: { w: 'majority' } }
        )
    );
}
