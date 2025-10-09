import { renderHook } from '@testing-library/react';

import { useImportHandler } from './useImportHandler';

describe('useImportHandler', () => {
    it('does not call the handle function when no data is provided', () => {
        const mockHandle = jest.fn();
        jest.mock('~/client/state/common/useImport', () => ({
            useImport: () => mockHandle,
        }));

        const { result } = renderHook(() => useImportHandler());
        const wrappedCallback = result.current;

        wrappedCallback(undefined as unknown as FormData);

        expect(mockHandle).not.toHaveBeenCalled();
    });

    it('returns a memoized callback', () => {
        const mockHandle = jest.fn();
        jest.mock('~/client/state/common/useImport', () => ({
            useImport: () => mockHandle,
        }));

        const { result, rerender } = renderHook(() => useImportHandler());
        const firstCallback = result.current;

        rerender();
        const secondCallback = result.current;

        expect(firstCallback).toBe(secondCallback);
    });
});
