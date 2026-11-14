import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import z from 'zod';

import { IMAGE_EXTENSION_BY_MIME_TYPE, MAX_IMAGE_FILE_SIZE } from '~/common/utils/files';
import { SchemaError } from '~/schema';
import { IMAGES_DIR } from '~/server/data/images';
import { STAGED_IMAGE_MAX_AGE_MS } from '~/server/data/stagedImageCleanup';

export const STAGED_IMAGES_DIR = path.join(IMAGES_DIR, '.pending');
const tokenPattern = /^upload:([a-f0-9]{64})$/;
const recordSchema = z.object({ owner: z.string(), image: z.string(), expires: z.number() });
export type ImageActionResult = { imageUnavailable: true } | undefined;

function filename(token: string): string | undefined {
    const match = tokenPattern.exec(token);
    return match ? path.join(STAGED_IMAGES_DIR, match[1]) : undefined;
}

async function read(token: string, owner: string) {
    const file = filename(token);
    if (!file) {
        return undefined;
    }
    try {
        const record = recordSchema.parse(JSON.parse(await fs.readFile(file, 'utf8')));
        return record.owner === owner ? record : undefined;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return undefined;
        }
        throw error;
    }
}

export async function stageImage(image: unknown, owner: string): Promise<string> {
    if (typeof image !== 'string' || !owner) {
        throw new Error(SchemaError.InvalidRequest);
    }
    const match = /^data:([^;]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
    if (!match || !IMAGE_EXTENSION_BY_MIME_TYPE[match[1]]) {
        throw new Error(SchemaError.InvalidImageType);
    }
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > MAX_IMAGE_FILE_SIZE) {
        throw new Error(SchemaError.ImageTooLarge);
    }
    const metadata = await sharp(bytes)
        .metadata()
        .catch(() => undefined);
    if (!metadata || !['png', 'jpeg', 'gif', 'webp'].includes(metadata.format ?? '')) {
        throw new Error(SchemaError.InvalidImageType);
    }
    const token = `upload:${randomBytes(32).toString('hex')}`;
    await fs.mkdir(STAGED_IMAGES_DIR, { recursive: true });
    await fs.writeFile(
        filename(token)!,
        JSON.stringify({ owner, image, expires: Date.now() + STAGED_IMAGE_MAX_AGE_MS }),
        { flag: 'wx', mode: 0o600 }
    );
    return token;
}

export async function dropStagedImage(token: string, owner: string): Promise<void> {
    if (await read(token, owner)) {
        await fs.unlink(filename(token)!).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        });
    }
}

/** Claims a token once; the private source remains independent from permanent image files. */
export async function withStagedImage<T extends { image?: string }>(
    request: T,
    owner: string,
    persist: (request: T) => Promise<void>
): Promise<ImageActionResult> {
    if (!request.image?.startsWith('upload:')) {
        await persist(request);
        return;
    }
    const source = filename(request.image);
    const record = await read(request.image, owner);
    if (!source || !record || record.expires <= Date.now()) {
        const { image: _image, ...rest } = request;
        await persist(rest as T);
        return { imageUnavailable: true };
    }
    const claimsDirectory = path.join(STAGED_IMAGES_DIR, '.claims');
    await fs.mkdir(claimsDirectory, { recursive: true });
    const claimed = path.join(claimsDirectory, randomBytes(32).toString('hex'));
    try {
        await fs.rename(source, claimed);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
        const { image: _image, ...rest } = request;
        await persist(rest as T);
        return { imageUnavailable: true };
    }
    try {
        await persist({ ...request, image: record.image });
    } catch (error) {
        await fs.rename(claimed, source).catch(async (restoreError: NodeJS.ErrnoException) => {
            if (restoreError.code !== 'ENOENT') {
                throw restoreError;
            }
            await fs.writeFile(source, JSON.stringify(record), { flag: 'wx', mode: 0o600 });
        });
        throw error;
    }
    await fs.unlink(claimed).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    });
}
