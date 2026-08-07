import fs from 'node:fs/promises';
import path from 'node:path';

import JSZip from 'jszip';

import { exportEverything } from '~/server/data/common';
import { IMAGES_DIR, resolveImagePath } from '~/server/data/images';
import type { ApiExport } from '~/types/api';
import type { Group, Product } from '~/types/data';

const DATA_ENTRY = 'data.json';
const IMAGES_ENTRY_PREFIX = 'images/';
const IMAGE_ENTRY_PATTERN = /^images\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32}\.[a-z0-9]+$/;

function collectImageUrls(products: readonly Product[], groups: readonly Group[]): string[] {
    const urls = new Set<string>();
    for (const product of products) {
        if (product.image) {
            urls.add(product.image);
        }
        if (product.photo) {
            urls.add(product.photo);
        }
        for (const image of [
            ...Object.values(product.variantImages ?? {}),
            ...Object.values(product.variantPhotos ?? {}),
        ]) {
            if (image) {
                urls.add(image);
            }
        }
    }
    for (const group of groups) {
        if (group.image) {
            urls.add(group.image);
        }
        if (group.photo) {
            urls.add(group.photo);
        }
    }
    return [...urls];
}

export async function buildExportArchive(): Promise<Buffer> {
    const data = await exportEverything();
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

export interface ImportArchiveImage {
    relativePath: string;
    content: Buffer;
}

export interface ImportArchive {
    data: ApiExport;
    images: ImportArchiveImage[];
}

export async function readImportArchive(buffer: Buffer): Promise<ImportArchive> {
    const zip = await JSZip.loadAsync(buffer);
    const dataEntry = zip.file(DATA_ENTRY);
    if (!dataEntry) {
        throw new Error(`Archive is missing ${DATA_ENTRY}`);
    }
    const data = JSON.parse(await dataEntry.async('string')) as ApiExport;

    const images: ImportArchiveImage[] = [];
    for (const [entryPath, entry] of Object.entries(zip.files)) {
        if (entry.dir || !IMAGE_ENTRY_PATTERN.test(entryPath)) {
            continue;
        }
        images.push({
            relativePath: entryPath.slice(IMAGES_ENTRY_PREFIX.length),
            content: await entry.async('nodebuffer'),
        });
    }

    return { data, images };
}

export async function writeImportImages(images: readonly ImportArchiveImage[]): Promise<void> {
    for (const { relativePath, content } of images) {
        const filePath = path.join(IMAGES_DIR, relativePath);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
    }
}
