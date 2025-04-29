import { act, renderHook } from '@testing-library/react';
import { useToggle } from '~/client/hooks/useToggle';

describe('useToggle', () => {
    it('returns default value', () => {
        const { result } = renderHook(() => useToggle());

        expect(result.current[0]).toBeFalse();
    });

    it('returns initial value', () => {
        const { result } = renderHook(() => useToggle(true));

        expect(result.current[0]).toBeTrue();
    });

    it('toggles value to false', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => result.current[1]());

        expect(result.current[0]).toBeFalse();
    });

    it('toggles value to true', () => {
        const { result } = renderHook(() => useToggle());
        act(() => result.current[1]());

        expect(result.current[0]).toBeTrue();
    });

    it('sets value to true', () => {
        const { result } = renderHook(() => useToggle());
        act(() => result.current[2]());

        expect(result.current[0]).toBeTrue();
    });

    it('does not toggle value if true', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => result.current[2]());

        expect(result.current[0]).toBeTrue();
    });

    it('sets value to false', () => {
        const { result } = renderHook(() => useToggle(true));
        act(() => result.current[3]());

        expect(result.current[0]).toBeFalse();
    });

    it('does not toggle value if false', () => {
        const { result } = renderHook(() => useToggle());
        act(() => result.current[3]());

        expect(result.current[0]).toBeFalse();
    });
});
