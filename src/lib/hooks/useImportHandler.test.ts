import { renderHook } from '@testing-library/react';

import { useImport } from '~/lib/hooks/useImport';
import { trackFaroEvent } from '~/lib/observability/faro';
import { useImportHandler } from './useImportHandler';

vi.mock(import('~/lib/hooks/useImport'));
vi.mock(import('~/lib/observability/faro'));

describe('useImportHandler', () => {
    const mockHandle = vi.fn();

    beforeEach(() => {
        vi.mocked(useImport).mockReturnValue(mockHandle);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls the handle function when data is provided', async () => {
        const { result } = renderHook(() => useImportHandler());
        const wrappedCallback = result.current;
        const formData = new FormData();

        await wrappedCallback(formData);

        expect(mockHandle).toHaveBeenCalledWith(formData);
        expect(trackFaroEvent).toHaveBeenLastCalledWith('data_action', {
            entity: 'archive',
            action: 'import',
            result: 'success',
        });
    });

    it('forwards the progress callback with the import data', () => {
        const { result } = renderHook(() => useImportHandler());
        const formData = new FormData();
        const onProgress = vi.fn();

        result.current(formData, onProgress);

        expect(mockHandle).toHaveBeenCalledExactlyOnceWith(formData, onProgress);
    });

    it('does not call the handle function when no data is provided', () => {
        const { result } = renderHook(() => useImportHandler());
        const wrappedCallback = result.current;

        wrappedCallback(undefined as unknown as FormData);

        expect(mockHandle).not.toHaveBeenCalled();
    });

    it('returns a memoized callback', () => {
        const { result, rerender } = renderHook(() => useImportHandler());
        const firstCallback = result.current;

        rerender();

        const secondCallback = result.current;

        expect(firstCallback).toBe(secondCallback);
    });

    it('reports import failure using only static attributes and rethrows', async () => {
        mockHandle.mockRejectedValueOnce(new Error('private filename'));
        const { result } = renderHook(() => useImportHandler());

        await expect(result.current(new FormData())).rejects.toThrow('private filename');
        expect(trackFaroEvent).toHaveBeenLastCalledWith('data_action', {
            entity: 'archive',
            action: 'import',
            result: 'error',
        });
    });
});
