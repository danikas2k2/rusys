// @vitest-environment node
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { mockUploadedFile } from '@tests/mockUploadedFile';

import { handleImport } from '~/server/api/handleImport';
import { getProductsWithGroups } from '~/server/api/response';
import { importEverything } from '~/server/data/common';
import { getValidator } from '~/server/data/schema/getValidator';
import type { ApiProductsWithGroups, ApiWithFiles } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/common'));
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
            files: { import: [mockUploadedFile('file1.json', '{}'), mockUploadedFile('file2.json', '{}')] },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Only one file can be imported at a time',
        });
    });

    it('returns error when single file list passed but content cannot be parsed', async () => {
        const request = mockRequest<ApiWithFiles>({
            files: { import: [mockUploadedFile('invalid.json', 'invalid json')] },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Invalid file content',
        });
    });

    it('returns error when single file passed but content cannot be parsed', async () => {
        const request = mockRequest<ApiWithFiles>({
            files: { import: mockUploadedFile('invalid.json', 'invalid json') },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Invalid file content',
        });
    });

    it('returns error when file content is invalid', async () => {
        vi.mocked(getValidator).mockReturnValueOnce(vi.fn(() => false) as any);

        const request = mockRequest<ApiWithFiles>({
            files: { import: mockUploadedFile('invalid.json', '{"invalid":"content"}') },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(response.json).toHaveBeenCalledWith({
            ok: false,
            error: 'Error: Invalid file content',
        });
    });

    it('imports data successfully when file content is valid', async () => {
        const years = getYearsFixture();
        const products = getProductsFixture();
        const variants = getVariantsFixture();
        const groups = getGroupsFixture();
        const results = {
            years,
            products,
            variants,
            groups,
        };

        vi.mocked(importEverything).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithGroups).mockResolvedValueOnce(results);

        const request = mockRequest({
            files: {
                import: mockUploadedFile('valid.json', JSON.stringify({ products, variants, groups })),
            },
        });
        const response = mockResponse<ApiProductsWithGroups>();

        await handleImport(request, response);

        expect(importEverything).toHaveBeenCalledWith(expect.any(Array), variants, groups);
        expect(response.json).toHaveBeenCalledWith({ ok: true, ...results });
    });
});
