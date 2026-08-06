import { renderHook } from '@testing-library/react';

import { useImport } from '~/client/state/common/useImport';
import { useImportHandler } from './useImportHandler';

vi.mock(import('~/client/state/common/useImport'));

describe('useImportHandler', () => {
    const mockHandle = vi.fn();

    beforeEach(() => {
        vi.mocked(useImport).mockReturnValue(mockHandle);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls the handle function when data is provided', () => {
        const { result } = renderHook(() => useImportHandler());
        const wrappedCallback = result.current;
        const formData = new FormData();

        wrappedCallback(formData);

        expect(mockHandle).toHaveBeenCalledWith(formData);
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
});
