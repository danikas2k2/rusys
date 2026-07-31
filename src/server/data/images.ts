import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { IMAGE_EXTENSION_BY_MIME_TYPE } from '~/common/utils/files';

// Mounted as a persistent Docker volume in production - see docker/compose.yaml
export const IMAGES_DIR = path.resolve('data/images');
export const IMAGES_URL_PATH = '/images';

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;

// Shards files across 256*256 sub-directories by uid prefix (like a content-addressable store),
// so a single directory never accumulates a huge, unbrowsable number of files.
function shardedPath(uid: string, extension: string): string {
    return path.join(uid.slice(0, 2), uid.slice(2, 4), `${uid}.${extension}`);
}

export async function saveImage(dataUrl: string): Promise<string> {
    const match = DATA_URL_PATTERN.exec(dataUrl);
    if (!match) {
        throw new Error('Unsupported image type');
    }
    const [, mimeType, base64] = match;
    const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimeType];
    if (!extension) {
        throw new Error('Unsupported image type');
    }

    const relativePath = shardedPath(randomUUID().replace(/-/g, ''), extension);
    const filePath = path.join(IMAGES_DIR, relativePath);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(base64, 'base64'));

    return `${IMAGES_URL_PATH}/${relativePath}`;
}

// Removes now-empty shard directories left behind after deleting a file, up to (but not including) IMAGES_DIR.
async function removeEmptyDirs(dir: string): Promise<void> {
    if (dir === IMAGES_DIR) {
        return;
    }
    const entries = await fs.readdir(dir).catch(() => undefined);
    if (!entries || entries.length > 0) {
        return;
    }
    await fs.rmdir(dir).catch(() => undefined);
    await removeEmptyDirs(path.dirname(dir));
}

// Resolves an /images/... URL to its on-disk path, or undefined if the url isn't a local image.
export function resolveImagePath(url?: string): string | undefined {
    if (!url?.startsWith(`${IMAGES_URL_PATH}/`)) {
        return undefined;
    }
    return path.join(IMAGES_DIR, url.slice(IMAGES_URL_PATH.length + 1));
}

export async function deleteImage(url?: string): Promise<void> {
    const filePath = resolveImagePath(url);
    if (!filePath) {
        return;
    }
    await fs.unlink(filePath).catch(() => undefined);
    await removeEmptyDirs(path.dirname(filePath));
}
