import { MongoServerError } from 'mongodb';
import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleImport } from '~/server/api/v1/imports/handleImport';
import { importEverything, readImportArchive, writeImportImages } from '~/server/data/import';

vi.mock(import('~/server/data/import'), async (original) => ({
    ...(await original()),
    importEverything: vi.fn(),
    readImportArchive: vi.fn(),
    writeImportImages: vi.fn(),
}));

async function upload(withFile = true) {
    const form = new FormData();
    if (withFile) {
        form.append('import', new File(['archive'], 'backup.zip', { type: 'application/zip' }));
    }
    const request = new NextRequest('http://localhost/api/v1/imports', { method: 'POST', body: form });
    return runApiHandler(request, handleImport);
}

describe('handleImport', () => {
    const image = 'ab/cd/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png';
    const data = {
        products: [
            {
                group: 'Uogienės',
                name: 'Avietės',
                image: `/images/${image}`,
                updates: [{ time: '2026-09-01T00:00:00.000Z', years: [] }],
            },
        ],
        variants: [],
        groups: [],
    };
    const images = [{ relativePath: image, content: Buffer.from('image') }];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(readImportArchive).mockResolvedValue({ data, images });
        vi.mocked(writeImportImages).mockResolvedValue(undefined);
        vi.mocked(importEverything).mockImplementation(async (_data, restoreImages) => restoreImages());
    });

    it('requires an import file', async () => {
        expect((await upload(false)).status).toBe(400);
        expect(readImportArchive).not.toHaveBeenCalled();
    });

    it.each([
        null,
        { ...data, unknown: true },
        { ...data, products: [{ group: 'A', name: 'P', updates: [{ time: 0 }] }] },
        {
            ...data,
            products: [{ group: 'A', name: 'P', years: [{ year: 0, amounts: [{ variant: 'v', amount: '0.5' }] }] }],
        },
    ])('validates real archive content before writing any images or data: %j', async (invalidData) => {
        vi.mocked(readImportArchive).mockResolvedValueOnce({ data: invalidData, images });
        const response = await upload();

        expect(response.status).toBe(400);
        expect(writeImportImages).not.toHaveBeenCalled();
        expect(importEverything).not.toHaveBeenCalled();
    });

    it.each(['variantImages', 'variantPhotos', 'variantImagesChecked'])(
        'rejects an invalid own __proto__ value in %s before any writes',
        async (field) => {
            const invalidMap: unknown = JSON.parse('{"__proto__":5}');

            vi.mocked(readImportArchive).mockResolvedValueOnce({
                data: { ...data, products: [{ group: 'A', name: 'P', [field]: invalidMap }] },
                images,
            });

            expect((await upload()).status).toBe(400);
            expect(writeImportImages).not.toHaveBeenCalled();
            expect(importEverything).not.toHaveBeenCalled();
        }
    );

    it('normalizes legacy history while preserving image-check metadata and names', async () => {
        const legacyProduct = {
            group: ' A: ',
            name: '',
            years: null,
            updates: [{ time: '2026-09-01T00:00:00Z', years: null }],
            undates: [{ time: '2026-08-01T00:00:00Z', years: null }],
            imageChecked: true,
            variantImagesChecked: { v: false },
        };
        const variants = [{ group: ' A: ', variant: '', order: 0, units: 'legacy-unit' }];

        vi.mocked(readImportArchive).mockResolvedValueOnce({
            data: {
                products: [legacyProduct, { group: '', name: '', updates: null, undates: null }],
                variants,
                groups: [],
            },
            images,
        });

        expect((await upload()).status).toBe(204);
        expect(importEverything).toHaveBeenCalledWith(
            {
                products: [
                    {
                        ...legacyProduct,
                        years: undefined,
                        updates: [{ time: Date.parse('2026-09-01T00:00:00Z'), years: [] }],
                        undates: [{ time: Date.parse('2026-08-01T00:00:00Z'), years: [] }],
                    },
                    { group: '', name: '', updates: undefined, undates: undefined },
                ],
                variants,
                groups: [],
            },
            expect.any(Function)
        );
    });

    it('restores images and normalizes history timestamps before importing data', async () => {
        const response = await upload();

        expect(response.status).toBe(204);
        expect(readImportArchive).toHaveBeenCalledWith(Buffer.from('archive'));
        expect(writeImportImages).toHaveBeenCalledWith([expect.objectContaining({ content: images[0].content })]);
        expect(importEverything).toHaveBeenCalledWith(
            {
                products: [
                    {
                        group: 'Uogien\u0117s',
                        name: 'Aviet\u0117s',
                        image: expect.stringMatching(/^\/images\//),
                        updates: [{ time: Date.parse('2026-09-01T00:00:00.000Z'), years: [] }],
                    },
                ],
                variants: [],
                groups: [],
            },
            expect.any(Function)
        );
    });

    it('distinguishes duplicate records, storage failures, and unreadable ZIPs', async () => {
        vi.mocked(importEverything).mockRejectedValueOnce(new MongoServerError({ code: 11000, message: 'duplicate' }));

        expect((await upload()).status).toBe(422);

        vi.mocked(importEverything).mockRejectedValueOnce(new Error('Transaction failed'));

        expect((await upload()).status).toBe(500);

        vi.mocked(readImportArchive).mockRejectedValueOnce(new Error('Invalid ZIP'));
        const response = await upload();

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'INVALID_IMPORT' } });
    });
});
