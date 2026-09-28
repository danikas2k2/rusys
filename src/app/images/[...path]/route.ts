import fs from 'node:fs/promises';
import path from 'node:path';

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

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
    const parts = (await context.params).path;
    if (parts.length === 0 || parts.some((part) => part === '.' || part === '..' || part.includes('\\'))) {
        return new Response(null, { status: 404 });
    }

    const filePath = path.resolve(/*turbopackIgnore: true*/ IMAGES_DIR, ...parts);
    if (!filePath.startsWith(`${IMAGES_DIR}${path.sep}`)) {
        return new Response(null, { status: 404 });
    }

    try {
        const image = await fs.readFile(filePath);
        const extension = path.extname(filePath).slice(1).toLowerCase();
        return new Response(image, {
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Type': CONTENT_TYPES[extension] ?? 'application/octet-stream',
            },
        });
    } catch {
        return new Response(null, { status: 404 });
    }
}
