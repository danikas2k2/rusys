/** @jest-environment node */
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleExport } from '~/server/api/handleExport';
import { exportEverything } from '~/server/data/common';
import type { ApiExport } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/data/common');

describe('handleExport', () => {
    const request = mockRequest();
    const response = mockResponse<ApiExport>();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(exportEverything).mockResolvedValueOnce({ details, variants, groups });

        await handleExport(request, response);

        expect(exportEverything).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, details, variants, groups });
    });

    it('returns error response on error', async () => {
        jest.mocked(exportEverything).mockRejectedValueOnce('Failed to export');

        await handleExport(request, response);

        expect(exportEverything).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to export' });
    });
});
