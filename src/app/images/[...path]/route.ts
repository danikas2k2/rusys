import fs from 'node:fs/promises';
import path from 'node:path';

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

interface RouteContext {
    params: Promise<{ path: string[] }>;
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
    if (!(await getSessionProfile())) {
        return new Response(null, { status: 401 });
    }
    const parts = (await context.params).path;
    if (parts.length === 0 || parts.some((part) => part === '.' || part === '..' || part.includes('\\'))) {
        return new Response(null, { status: 404 });
    }

    const filePath = path.resolve(/*turbopackIgnore: true*/ IMAGES_DIR, ...parts);
    if (!filePath.startsWith(`${IMAGES_DIR}${path.sep}`)) {
        return new Response(null, { status: 404 });
    }

    try {
        const stats = await fs.stat(filePath, { bigint: true });
        if (!stats.isFile()) {
            return new Response(null, { status: 404 });
        }
        // Nanosecond precision also detects an import that replaces a file within the same second.
        const etag = `W/"${stats.mtimeNs.toString(16)}-${stats.size.toString(16)}"`;
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

        const image = await fs.readFile(filePath);
        const extension = path.extname(filePath).slice(1).toLowerCase();
        headers.set('Content-Type', CONTENT_TYPES[extension] ?? 'application/octet-stream');
        return new Response(image, {
            headers,
        });
    } catch {
        return new Response(null, { status: 404 });
    }
}
