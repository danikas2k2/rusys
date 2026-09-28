import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { IMAGE_EXTENSION_BY_MIME_TYPE } from '~/common/utils/files';

// Mounted as a persistent Docker volume in production - see docker/compose.yaml
export const IMAGES_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.IMAGES_DIR ?? 'data/images');
export const IMAGES_URL_PATH = '/images';

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;

// Matches the client-side heuristic this replaces: within icon-sized bounds and roughly square is
// an icon, anything bigger or more elongated is a photo.
const ICON_MAX_SIZE = 512;
const ICON_MIN_ASPECT = 0.75;
const ICON_MAX_ASPECT = 1.33;

// Shards files across 256*256 sub-directories by uid prefix (like a content-addressable store),
// so a single directory never accumulates a huge, unbrowsable number of files.
function shardedPath(uid: string, extension: string): string {
    return path.join(/*turbopackIgnore: true*/ uid.slice(0, 2), uid.slice(2, 4), `${uid}.${extension}`);
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
    const filePath = path.join(/*turbopackIgnore: true*/ IMAGES_DIR, relativePath);

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
    return path.join(/*turbopackIgnore: true*/ IMAGES_DIR, url.slice(IMAGES_URL_PATH.length + 1));
}

export async function deleteImage(url?: string): Promise<void> {
    const filePath = resolveImagePath(url);
    if (!filePath) {
        return;
    }
    await fs.unlink(filePath).catch(() => undefined);
    await removeEmptyDirs(path.dirname(filePath));
}

// Deletes an image/photo pair together - the two are always replaced or removed as a unit.
export async function deleteImages(image?: string, photo?: string): Promise<void> {
    await Promise.all([deleteImage(image), deleteImage(photo)]);
}

async function isPhotoSized(filePath: string): Promise<boolean> {
    const { width, height } = await sharp(filePath)
        .metadata()
        .catch(() => ({ width: undefined, height: undefined }));
    if (!width || !height) {
        return false;
    }
    const aspect = width / height;
    const isIconSized = width <= ICON_MAX_SIZE && height <= ICON_MAX_SIZE;
    const isSquareish = aspect >= ICON_MIN_ASPECT && aspect <= ICON_MAX_ASPECT;
    return !(isIconSized && isSquareish);
}

async function saveThumbnail(sourcePath: string): Promise<string> {
    const extension = path.extname(sourcePath).slice(1) || 'jpg';
    const relativePath = shardedPath(randomUUID().replace(/-/g, ''), extension);
    const filePath = path.join(/*turbopackIgnore: true*/ IMAGES_DIR, relativePath);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await sharp(sourcePath).resize(ICON_MAX_SIZE, ICON_MAX_SIZE, { fit: 'cover' }).toFile(filePath);

    return `${IMAGES_URL_PATH}/${relativePath}`;
}

export interface ClassifiedImage {
    image: string;
    photo?: string;
}

// Classifies an already-saved local image by its real pixel dimensions, generating an icon-sized
// thumbnail (returned as `image`) when it's a photo (kept in full as `photo`). Used both right
// after a fresh upload and to lazily backfill an old, pre-classification `image` field on read.
export async function classifyImage(url: string): Promise<ClassifiedImage> {
    const filePath = resolveImagePath(url);
    if (!filePath || !(await isPhotoSized(filePath))) {
        return { image: url };
    }
    return { image: await saveThumbnail(filePath), photo: url };
}
