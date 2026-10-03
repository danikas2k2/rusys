import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { getSessionProfile } from '~/server/auth/session';
import { IMAGES_DIR } from '~/server/data/images';

export const runtime = 'nodejs';

const CONTENT_TYPES: Readonly<Record<string, string>> = {
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};
const MAX_DIMENSION = 2048;
const VARIANTS_DIR = path.join(IMAGES_DIR, '.variants');

function parseDimension(values: string[]): number | undefined | null {
    if (values.length === 0) {
        return undefined;
    }
    if (values.length !== 1 || !/^[1-9]\d*$/.test(values[0])) {
        return null;
    }
    const value = Number(values[0]);
    return Number.isSafeInteger(value) && value <= MAX_DIMENSION ? value : null;
}

async function readVariant(filePath: string, cachePath: string, width?: number, height?: number): Promise<Buffer> {
    try {
        return await fs.readFile(cachePath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }

    const image = await sharp(filePath, { animated: true })
        .resize({ width, height, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    const temporaryPath = `${cachePath}.${randomUUID()}.tmp`;
    try {
        await fs.writeFile(temporaryPath, image);
        await fs.rename(temporaryPath, cachePath);
    } finally {
        await fs.rm(temporaryPath, { force: true });
    }
    return image;
}

interface RouteContext {
    params: Promise<{ path: string[] }>;
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
    if (!(await getSessionProfile())) {
        return new Response(null, { status: 401 });
    }
    const parts = (await context.params).path;
    if (parts.length === 0 || parts.some((part) => part.startsWith('.') || part.includes('\\'))) {
        return new Response(null, { status: 404 });
    }

    const url = new URL(request.url);
    const width = parseDimension(url.searchParams.getAll('w'));
    const height = parseDimension(url.searchParams.getAll('h'));
    if (width === null || height === null) {
        return new Response(null, { status: 400 });
    }
    const resized = width !== undefined || height !== undefined;

    const filePath = path.resolve(/*turbopackIgnore: true*/ IMAGES_DIR, ...parts);
    if (!filePath.startsWith(`${IMAGES_DIR}${path.sep}`)) {
        return new Response(null, { status: 404 });
    }

    let stats;
    try {
        stats = await fs.stat(filePath, { bigint: true });
        if (!stats.isFile()) {
            return new Response(null, { status: 404 });
        }
    } catch {
        return new Response(null, { status: 404 });
    }

    const extension = path.extname(filePath).slice(1).toLowerCase();
    if (resized && !CONTENT_TYPES[extension]) {
        return new Response(null, { status: 415 });
    }

    try {
        // Nanosecond precision also detects an import that replaces a file within the same second.
        const sourceVersion = `${stats.mtimeNs.toString(16)}-${stats.size.toString(16)}`;
        const etag = resized ? `W/"${sourceVersion}-${width ?? 0}-${height ?? 0}"` : `W/"${sourceVersion}"`;
        const headers = new Headers({
            'Cache-Control': 'private, no-cache',
            ETag: etag,
            'Last-Modified': stats.mtime.toUTCString(),
            Vary: 'Cookie',
        });
        if (
            request.headers
                .get('If-None-Match')
                ?.split(',')
                .some((tag) => tag.trim() === etag || tag.trim() === '*')
        ) {
            return new Response(null, { status: 304, headers });
        }

        let image: Buffer;
        if (resized) {
            const sourceKey = createHash('sha256').update(filePath).digest('hex');
            const cachePath = path.join(
                VARIANTS_DIR,
                sourceKey,
                `${sourceVersion}-${width ?? 0}-${height ?? 0}.${extension}`
            );
            image = await readVariant(filePath, cachePath, width, height);
        } else {
            image = await fs.readFile(filePath);
        }
        headers.set('Content-Type', CONTENT_TYPES[extension] ?? 'application/octet-stream');
        return new Response(new Uint8Array(image), {
            headers,
        });
    } catch {
        return new Response(null, { status: 500 });
    }
}
