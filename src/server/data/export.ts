import fs from 'node:fs/promises';
import path from 'node:path';

import JSZip from 'jszip';
import type { ClientSession } from 'mongodb';

import type { ExportArchiveData, Group, Product, Variant } from '~/schema';
import { DATA_ENTRY, IMAGES_ENTRY_PREFIX } from '~/server/data/archive';
import { IMAGES_DIR, resolveImagePath } from '~/server/data/images';
import { db } from '~/server/db';

export async function exportEverything(session: ClientSession): Promise<ExportArchiveData> {
    const d = await db();
    return {
        products: await d
            .collection<Product>('products')
            .find({}, { projection: { _id: 0 }, session })
            .toArray(),
        variants: await d
            .collection<Variant>('variants')
            .find({}, { projection: { _id: 0 }, session })
            .toArray(),
        groups: await d
            .collection<Group>('groups')
            .find({}, { projection: { _id: 0 }, session })
            .toArray(),
    };
}

function* collectImageUrls(products: readonly Product[], groups: readonly Group[]): Generator<string> {
    const seen = new Set<string>();
    for (const product of products) {
        for (const url of [
            product.image,
            product.photo,
            ...Object.values(product.variantImages ?? {}),
            ...Object.values(product.variantPhotos ?? {}),
        ]) {
            if (url && !seen.has(url)) {
                seen.add(url);
                yield url;
            }
        }
    }
    for (const group of groups) {
        for (const url of [group.image, group.photo]) {
            if (url && !seen.has(url)) {
                seen.add(url);
                yield url;
            }
        }
    }
}

export async function buildExportArchive(data: ExportArchiveData): Promise<Buffer> {
    const zip = new JSZip();
    zip.file(DATA_ENTRY, JSON.stringify(data));

    for (const url of collectImageUrls(data.products, data.groups)) {
        const filePath = resolveImagePath(url);
        const content = filePath ? await fs.readFile(filePath).catch(() => undefined) : undefined;
        if (content) {
            zip.file(`${IMAGES_ENTRY_PREFIX}${path.relative(IMAGES_DIR, filePath!)}`, content);
        }
    }

    return zip.generateAsync({ type: 'nodebuffer' });
}
