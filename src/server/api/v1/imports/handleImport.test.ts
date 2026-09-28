import type { ValidateFunction } from 'ajv';
import { NextRequest } from 'next/server';

import type { ExportArchiveData } from '~/common/data';
import { runApiHandler } from '~/server/api/next';
import { handleImport } from '~/server/api/v1/imports/handleImport';
import { importEverything } from '~/server/data/common';
import { readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { getValidator } from '~/server/data/schema/getValidator';

vi.mock(import('~/server/data/common'), () => ({ importEverything: vi.fn() }));
vi.mock(import('~/server/data/exportArchive'), () => ({ readImportArchive: vi.fn(), writeImportImages: vi.fn() }));
vi.mock(import('~/server/data/schema/getValidator'), () => ({ getValidator: vi.fn() }));

async function upload(withFile = true) {
    const form = new FormData();
    if (withFile) {
        form.append('import', new File(['archive'], 'backup.zip', { type: 'application/zip' }));
    }
    const request = new NextRequest('http://localhost/api/v1/imports', { method: 'POST', body: form });
    return runApiHandler(request, handleImport);
}

describe('handleImport', () => {
    const data = {
        products: [{ group: 'Uogienės', name: 'Avietės', updates: [{ time: '2026-09-01T00:00:00.000Z', years: [] }] }],
        variants: [],
        groups: [],
    } as unknown as ExportArchiveData;
    const images = [{ relativePath: 'ab/cd/image.png', content: Buffer.from('image') }];
    const validate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        validate.mockReturnValue(true);
        vi.mocked(getValidator).mockReturnValue(validate as ValidateFunction<ExportArchiveData>);
        vi.mocked(readImportArchive).mockResolvedValue({ data, images });
        vi.mocked(writeImportImages).mockResolvedValue(undefined);
        vi.mocked(importEverything).mockResolvedValue(true);
    });

    it('requires an import file', async () => {
        expect((await upload(false)).status).toBe(400);
        expect(readImportArchive).not.toHaveBeenCalled();
    });

    it('validates the archive before writing any images or data', async () => {
        validate.mockReturnValueOnce(false);
        const response = await upload();

        expect(response.status).toBe(400);
        expect(writeImportImages).not.toHaveBeenCalled();
        expect(importEverything).not.toHaveBeenCalled();
    });

    it('restores images and normalizes history timestamps before importing data', async () => {
        const response = await upload();

        expect(response.status).toBe(204);
        expect(readImportArchive).toHaveBeenCalledWith(Buffer.from('archive'));
        expect(writeImportImages).toHaveBeenCalledWith(images);
        expect(importEverything).toHaveBeenCalledWith(
            [
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    updates: [{ time: Date.parse('2026-09-01T00:00:00.000Z'), years: [] }],
                },
            ],
            [],
            []
        );
    });

    it('reports a rejected import and an unreadable archive', async () => {
        vi.mocked(importEverything).mockResolvedValueOnce(false);

        expect((await upload()).status).toBe(422);

        vi.mocked(readImportArchive).mockRejectedValueOnce(new Error('Invalid ZIP'));
        const response = await upload();

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'INVALID_IMPORT' } });
    });
});
