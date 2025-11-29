import { renderHook } from '@testing-library/react';

import { useForwardedRef } from '~/client/hooks/useForwardedRef';

describe('useForwardedRef', () => {
    it('calls ref function with current ref when ref is a function', () => {
        const ref = vi.fn();
        const { result } = renderHook(() => useForwardedRef(ref));

        expect(ref).toHaveBeenCalledWith(result.current.current);
    });

    it('sets ref object current value to current ref when ref is an object', () => {
        const ref = { current: null };
        const { result } = renderHook(() => useForwardedRef(ref));

        expect(ref.current).toBe(result.current.current);
    });

    it('does not throw error when ref is undefined', () => {
        const { result } = renderHook(() => useForwardedRef(undefined));

        expect(result.current.current).toBeNull();
    });

    it('sets current ref to initial value when provided', () => {
        const initialValue = document.createElement('div');
        const { result } = renderHook(() => useForwardedRef(undefined, initialValue));

        expect(result.current.current).toBe(initialValue);
    });
});
