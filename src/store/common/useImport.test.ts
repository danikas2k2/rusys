import { renderHook } from '@testing-library/react';

import { useImport } from '~/store/common/useImport';

describe('useImport', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('uploads the archive with multipart form data', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal('fetch', fetchMock);
        const data = new FormData();

        const { result } = renderHook(() => useImport());
        await result.current(data);

        expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/v1/imports', { method: 'POST', body: data });
    });

    it('reports an unsuccessful import', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 422 }));

        const { result } = renderHook(() => useImport());

        await expect(result.current(new FormData())).rejects.toThrow('Import failed (422)');
    });
});
