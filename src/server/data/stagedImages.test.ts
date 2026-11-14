/** @vitest-environment node */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

import { MAX_IMAGE_FILE_SIZE } from '~/common/utils/files';
import { SchemaError } from '~/schema';
import { cleanupStagedImages, STAGED_IMAGE_MAX_AGE_MS } from '~/server/data/stagedImageCleanup';
import type * as StagedImages from './stagedImages';

describe('staged image lifecycle', () => {
    let directory: string;
    let store: typeof StagedImages;
    let image: string;

    beforeAll(async () => {
        directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rusys-images-'));
        vi.stubEnv('IMAGES_DIR', directory);
        vi.resetModules();
        store = await import('./stagedImages');
        image = `data:image/png;base64,${(
            await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } })
                .png()
                .toBuffer()
        ).toString('base64')}`;
    });

    afterEach(() => vi.restoreAllMocks());

    afterAll(async () => {
        vi.unstubAllEnvs();
        await fs.rm(directory, { recursive: true, force: true });
    });

    it.each([
        [42, SchemaError.InvalidRequest],
        ['not an image', SchemaError.InvalidImageType],
        ['data:image/svg+xml;base64,AAAA', SchemaError.InvalidImageType],
    ])('rejects malformed or unsupported uploads (%s)', async (input, message) => {
        await expect(store.stageImage(input, 'owner')).rejects.toThrow(message);
    });

    it('rejects oversized uploads before trying to decode them', async () => {
        const bytes = Buffer.alloc(MAX_IMAGE_FILE_SIZE + 1);

        await expect(store.stageImage(`data:image/png;base64,${bytes.toString('base64')}`, 'owner')).rejects.toThrow(
            SchemaError.ImageTooLarge
        );
    });

    it('reports storage read failures without persisting unrelated data', async () => {
        const token = await store.stageImage(image, 'owner');
        vi.spyOn(fs, 'readFile').mockRejectedValueOnce(Object.assign(new Error('storage denied'), { code: 'EACCES' }));
        const persist = vi.fn();

        await expect(store.withStagedImage({ image: token }, 'owner', persist)).rejects.toThrow('storage denied');
        expect(persist).not.toHaveBeenCalled();
    });

    it.each([
        { code: 'ENOENT', outcome: undefined },
        { code: 'EACCES', outcome: 'delete failed' },
    ])('handles cancellation races and storage errors (%j)', async ({ code, outcome }) => {
        const token = await store.stageImage(image, 'owner');
        vi.spyOn(fs, 'unlink').mockRejectedValueOnce(Object.assign(new Error('delete failed'), { code }));
        const dropping = store.dropStagedImage(token, 'owner');

        await expect(dropping.catch((error: Error) => error.message)).resolves.toBe(outcome);
    });

    it('reports a failed claim without persisting changes or consuming the token', async () => {
        const token = await store.stageImage(image, 'owner');
        vi.spyOn(fs, 'rename').mockRejectedValueOnce(Object.assign(new Error('claim denied'), { code: 'EACCES' }));
        const persist = vi.fn();

        await expect(store.withStagedImage({ image: token }, 'owner', persist)).rejects.toThrow('claim denied');
        expect(persist).not.toHaveBeenCalled();
    });

    it('surfaces failure to restore a token after persistence failed', async () => {
        const token = await store.stageImage(image, 'owner');
        const rename = fs.rename.bind(fs);
        vi.spyOn(fs, 'rename')
            .mockImplementationOnce(rename)
            .mockRejectedValueOnce(Object.assign(new Error('restore denied'), { code: 'EACCES' }));

        await expect(
            store.withStagedImage({ image: token }, 'owner', async () => {
                throw new Error('persist failed');
            })
        ).rejects.toThrow('restore denied');
    });

    it.each([
        { code: 'ENOENT', outcome: undefined },
        { code: 'EACCES', outcome: 'cleanup failed' },
    ])('handles post-commit cleanup failure (%j)', async ({ code, outcome }) => {
        const token = await store.stageImage(image, 'owner');
        vi.spyOn(fs, 'unlink').mockRejectedValueOnce(Object.assign(new Error('cleanup failed'), { code }));
        const persist = vi.fn().mockResolvedValue(undefined);
        const applying = store.withStagedImage({ image: token }, 'owner', persist);

        await expect(applying.catch((error: Error) => error.message)).resolves.toBe(outcome);

        expect(persist).toHaveBeenCalledWith({ image });
    });

    it('claims a validated upload once and preserves other fields', async () => {
        const token = await store.stageImage(image, 'owner');
        const persist = vi.fn().mockResolvedValue(undefined);

        await expect(store.withStagedImage({ image: token, name: 'A' }, 'owner', persist)).resolves.toBeUndefined();
        expect(persist).toHaveBeenCalledWith({ image, name: 'A' });

        persist.mockClear();

        await expect(store.withStagedImage({ image: token, name: 'B' }, 'owner', persist)).resolves.toStrictEqual({
            imageUnavailable: true,
        });
        expect(persist).toHaveBeenCalledWith({ name: 'B' });
    });

    it('prevents another user from consuming or dropping an upload', async () => {
        const token = await store.stageImage(image, 'owner');
        await store.dropStagedImage(token, 'other');
        const persist = vi.fn().mockResolvedValue(undefined);

        await expect(store.withStagedImage({ image: token }, 'other', persist)).resolves.toStrictEqual({
            imageUnavailable: true,
        });
        expect(persist).toHaveBeenCalledWith({});
        await expect(store.withStagedImage({ image: token }, 'owner', persist)).resolves.toBeUndefined();
    });

    it('saves non-image changes after cancellation or cleanup', async () => {
        const token = await store.stageImage(image, 'owner');
        await store.dropStagedImage(token, 'owner');
        const persist = vi.fn().mockResolvedValue(undefined);

        await expect(store.withStagedImage({ image: token, review: true }, 'owner', persist)).resolves.toStrictEqual({
            imageUnavailable: true,
        });
        expect(persist).toHaveBeenCalledWith({ review: true });

        const expired = await store.stageImage(image, 'owner');
        await cleanupStagedImages(store.STAGED_IMAGES_DIR, Date.now() + STAGED_IMAGE_MAX_AGE_MS + 1000);

        await expect(store.withStagedImage({ image: expired, review: true }, 'owner', persist)).resolves.toStrictEqual({
            imageUnavailable: true,
        });
    });

    it('rejects expired tokens even before cleanup runs', async () => {
        const token = await store.stageImage(image, 'owner');
        const now = Date.now();
        vi.spyOn(Date, 'now').mockReturnValue(now + STAGED_IMAGE_MAX_AGE_MS + 1000);
        try {
            const persist = vi.fn().mockResolvedValue(undefined);

            await expect(
                store.withStagedImage({ image: token, annual: false }, 'owner', persist)
            ).resolves.toStrictEqual({
                imageUnavailable: true,
            });
            expect(persist).toHaveBeenCalledWith({ annual: false });
        } finally {
            vi.restoreAllMocks();
        }
    });

    it('restores the upload when persistence fails', async () => {
        const token = await store.stageImage(image, 'owner');

        await expect(
            store.withStagedImage({ image: token }, 'owner', async () => {
                throw new Error('failed');
            })
        ).rejects.toThrow('failed');
        await expect(store.withStagedImage({ image: token }, 'owner', async () => undefined)).resolves.toBeUndefined();
    });

    it('allows only one concurrent claim', async () => {
        const token = await store.stageImage(image, 'owner');
        const persist = vi.fn().mockResolvedValue(undefined);
        const results = await Promise.all([
            store.withStagedImage({ image: token }, 'owner', persist),
            store.withStagedImage({ image: token }, 'owner', persist),
        ]);

        expect(results.filter((result) => !result)).toHaveLength(1);
        expect(persist.mock.calls.filter(([request]) => request.image === image)).toHaveLength(1);
    });

    it('can restore a claim even when cleanup removed its private source during persistence', async () => {
        const token = await store.stageImage(image, 'owner');

        await expect(
            store.withStagedImage({ image: token }, 'owner', async () => {
                await cleanupStagedImages(
                    path.join(store.STAGED_IMAGES_DIR, '.claims'),
                    Date.now() + STAGED_IMAGE_MAX_AGE_MS + 1000
                );
                throw new Error('persistence failed');
            })
        ).rejects.toThrow('persistence failed');

        const persist = vi.fn().mockResolvedValue(undefined);

        await expect(store.withStagedImage({ image: token }, 'owner', persist)).resolves.toBeUndefined();
        expect(persist).toHaveBeenCalledWith({ image });
    });

    it('rejects invalid image bytes and malformed tokens without path access', async () => {
        await expect(store.stageImage('data:image/png;base64,AAAA', 'owner')).rejects.toThrow(
            SchemaError.InvalidImageType
        );
        await expect(store.stageImage(image, '')).rejects.toThrow(SchemaError.InvalidRequest);

        const persist = vi.fn().mockResolvedValue(undefined);

        await expect(store.withStagedImage({ image: 'upload:../../other' }, 'owner', persist)).resolves.toStrictEqual({
            imageUnavailable: true,
        });
        expect(persist).toHaveBeenCalledWith({});
    });
});
