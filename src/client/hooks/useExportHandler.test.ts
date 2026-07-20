import { renderHook } from '@testing-library/react';

import { useExport } from '~/client/state/common/useExport';
import { download } from '~/client/utils/download';
import { useExportHandler } from './useExportHandler';

vi.mock(import('~/client/utils/download'));
vi.mock(import('~/client/state/common/useExport'));

describe('useExportHandler', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls download with correct data when handle returns ok: true', async () => {
        const mockHandle = vi.fn().mockResolvedValue({ ok: true, data: { key: 'value' } });
        vi.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).toHaveBeenCalledWith({ data: { key: 'value' } });
    });

    it('does not call download when handle returns ok: false', async () => {
        const mockHandle = vi.fn().mockResolvedValue({ ok: false });
        vi.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).not.toHaveBeenCalled();
    });

    it('does not call download when handle returns null or undefined', async () => {
        const mockHandle = vi.fn().mockResolvedValue(null);
        vi.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).not.toHaveBeenCalled();
    });
});
