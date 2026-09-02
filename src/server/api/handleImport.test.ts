// @vitest-environment node
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { mockUploadedFile } from '@tests/mockUploadedFile';

import type { ApiProductsWithGroups, ApiWithFiles } from '~/common/api';
import { handleImport } from '~/server/api/handleImport';
import { getProductsWithGroups } from '~/server/api/response';
import { importEverything } from '~/server/data/common';
import { readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { getValidator } from '~/server/data/schema/getValidator';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/exportArchive'));
vi.mock(import('~/server/data/schema/getValidator'), () => ({
    getValidator: vi.fn(() => vi.fn(() => true)),
}));

describe('handleImport', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));

    afterEach(() => vi.clearAllMocks());

    it('returns error when no files are provided', async () => {
        const request = mockRequest();
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: File required to import',
        });
    });

    it('returns error when empty list of files are provided', async () => {
        const request = mockRequest<ApiWithFiles>({ files: { import: [] } });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: File required to import',
        });
    });

    it('returns error when multiple files are provided', async () => {
        const request = mockRequest<ApiWithFiles>({
            files: { import: [mockUploadedFile('file1.zip', ''), mockUploadedFile('file2.zip', '')] },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Only one file can be imported at a time',
        });
    });

    it('returns error when the archive cannot be read', async () => {
        vi.mocked(readImportArchive).mockRejectedValueOnce(new Error('Archive is missing data.json'));

        const request = mockRequest<ApiWithFiles>({
            files: { import: [mockUploadedFile('invalid.zip', 'not a zip')] },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Invalid file content',
        });
    });

    it('returns error when single file passed but archive cannot be read', async () => {
        vi.mocked(readImportArchive).mockRejectedValueOnce(new Error('Archive is missing data.json'));

        const request = mockRequest<ApiWithFiles>({
            files: { import: mockUploadedFile('invalid.zip', 'not a zip') },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Invalid file content',
        });
    });

    it('returns error when file content is invalid', async () => {
        vi.mocked(readImportArchive).mockResolvedValueOnce({
            data: { products: [], variants: [], groups: [] } as any,
            images: [],
        });
        vi.mocked(getValidator).mockReturnValueOnce(vi.fn(() => false) as any);

        const request = mockRequest<ApiWithFiles>({
            files: { import: mockUploadedFile('invalid.zip', 'zip-bytes') },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Invalid file content',
        });
        expect(writeImportImages).not.toHaveBeenCalled();
    });

    it('imports data and writes bundled images when file content is valid', async () => {
        const years = getYearsFixture();
        const products = getProductsFixture();
        const variants = getVariantsFixture();
        const groups = getGroupsFixture();
        const images = [{ relativePath: 'ab/cd/uuid.png', content: Buffer.from('image-bytes') }];
        const results = { years, products, variants, groups };

        vi.mocked(readImportArchive).mockResolvedValueOnce({
            data: { products, variants, groups },
            images,
        });
        vi.mocked(importEverything).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithGroups).mockResolvedValueOnce(results);

        const request = mockRequest<ApiWithFiles>({
            files: { import: mockUploadedFile('valid.zip', 'zip-bytes') },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(writeImportImages).toHaveBeenCalledWith(images);
        expect(importEverything).toHaveBeenCalledWith(expect.any(Array), variants, groups);
        expect(response.json).toHaveBeenCalledWith({ ok: true, ...results });
    });
});
