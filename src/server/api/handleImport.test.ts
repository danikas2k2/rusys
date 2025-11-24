/** @jest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { mockUploadedFile } from '@tests/mockUploadedFile';

import { handleImport } from '~/server/api/handleImport';
import { getProductsWithGroups } from '~/server/api/response';
import { importEverything } from '~/server/data/common';
import { getValidator } from '~/server/data/schema/getValidator';
import type { ApiProductsWithGroups, ApiWithFiles } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/common');
jest.mock('~/server/data/schema/getValidator', () => ({
    getValidator: jest.fn(() => jest.fn(() => true)),
}));

describe('handleImport', () => {
    beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

    afterEach(() => jest.clearAllMocks());

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
        jest.mocked(getValidator).mockReturnValueOnce(jest.fn(() => false) as any);

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

        jest.mocked(importEverything).mockResolvedValueOnce(true);
        jest.mocked(getProductsWithGroups).mockResolvedValueOnce(results);

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
