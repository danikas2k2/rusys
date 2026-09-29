import { renderHook } from '@testing-library/react';

import { useExport } from '~/store/common/useExport';

describe('useExport', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('downloads the archive as a blob', async () => {
        const archive = new Blob(['archive'], { type: 'application/zip' });
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(archive) });
        vi.stubGlobal('fetch', fetchMock);

        const { result } = renderHook(() => useExport());

        await expect(result.current()).resolves.toBe(archive);
        expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/v1/exports/latest');
    });

    it('reports an unsuccessful download', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

        const { result } = renderHook(() => useExport());

        await expect(result.current()).rejects.toThrow('Export failed (503)');
    });
});
