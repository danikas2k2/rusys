import { renderHook } from '@testing-library/react';

import { download } from '~/client/utils/download';
import { useExport } from '~/state/common/useExport';
import { useExportHandler } from './useExportHandler';

jest.mock('~/client/utils/download');
jest.mock('~/state/common/useExport');

describe('useExportHandler', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls download with correct data when handle returns ok: true', async () => {
        const mockHandle = jest.fn().mockResolvedValue({ ok: true, data: { key: 'value' } });
        jest.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).toHaveBeenCalledWith({ data: { key: 'value' } });
    });

    it('does not call download when handle returns ok: false', async () => {
        const mockHandle = jest.fn().mockResolvedValue({ ok: false });
        jest.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).not.toHaveBeenCalled();
    });

    it('does not call download when handle returns null or undefined', async () => {
        const mockHandle = jest.fn().mockResolvedValue(null);
        jest.mocked(useExport).mockReturnValue(mockHandle);

        const { result } = renderHook(() => useExportHandler());
        await result.current();

        expect(mockHandle).toHaveBeenCalledWith();
        expect(download).not.toHaveBeenCalled();
    });
});
