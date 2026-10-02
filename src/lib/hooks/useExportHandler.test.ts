import { renderHook } from '@testing-library/react';

import { useExport } from '~/lib/hooks/useExport';
import { download } from '~/lib/utils/download';
import { useExportHandler } from './useExportHandler';

vi.mock(import('~/lib/utils/download'));
vi.mock(import('~/lib/hooks/useExport'));

describe('useExportHandler', () => {
    afterEach(() => vi.clearAllMocks());

    it('downloads the returned blob with a dated zip filename', async () => {
        const blob = new Blob(['zip-bytes'], { type: 'application/zip' });
        const mockHandle = vi.fn().mockResolvedValue(blob);
        vi.mocked(useExport).mockReturnValue(mockHandle);

        const mockDate = new Date('2024-01-15T10:30:00.000Z');
        const dateSpy = vi.spyOn(globalThis, 'Date').mockImplementation(function () {
            return mockDate;
        } as unknown as typeof Date);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        dateSpy.mockRestore();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).toHaveBeenCalledWith(blob, '2024-01-15.zip');
    });

    it('propagates the error when the request fails', async () => {
        const mockHandle = vi.fn().mockRejectedValue(new Error('Request failed'));
        vi.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());

        await expect(result.current()).rejects.toThrow('Request failed');
        expect(download).not.toHaveBeenCalled();
    });
});
