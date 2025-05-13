import { renderHook } from '@testing-library/react';
import { useErrorWrapper } from '~/client/common/hooks/useErrorWrapper';

describe('useErrorWrapper', () => {
    it('calls the callback successfully', async () => {
        const mockCallback = jest.fn().mockResolvedValue('success');
        const { result } = renderHook(() => useErrorWrapper(mockCallback));

        const wrappedCallback = result.current;
        const response = await wrappedCallback();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(response).toBe('success');
    });

    it('handles error with default onError', async () => {
        const mockCallback = jest.fn().mockImplementation(() => {
            throw new Error('Test error');
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useErrorWrapper(mockCallback));

        const wrappedCallback = result.current;
        await wrappedCallback();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');

        consoleErrorSpy.mockRestore();
    });

    it('handles error with custom onError', async () => {
        const mockCallback = jest.fn().mockImplementation(() => {
            throw new Error('Test error');
        });
        const mockOnError = jest.fn();

        const { result } = renderHook(() => useErrorWrapper(mockCallback, mockOnError));

        const wrappedCallback = result.current;
        await wrappedCallback();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });
});
