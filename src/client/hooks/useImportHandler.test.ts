import { renderHook } from '@testing-library/react';

import { useImportHandler } from './useImportHandler';

const mockHandle = vi.fn();
vi.mock('~/client/state/common/useImport', async () => ({
    useImport: () => mockHandle,
}));

describe('useImportHandler', () => {
    afterEach(() => vi.clearAllMocks());

    it('does not call the handle function when no data is provided', () => {
        const { result } = renderHook(() => useImportHandler());

        const data = new FormData();
        result.current(data);

        expect(mockHandle).toHaveBeenCalledWith(data);
    });

    it('returns a memoized callback', () => {
        const { result, rerender } = renderHook(() => useImportHandler());
        const firstCallback = result.current;

        rerender();

        const secondCallback = result.current;

        expect(firstCallback).toBe(secondCallback);
    });
});
