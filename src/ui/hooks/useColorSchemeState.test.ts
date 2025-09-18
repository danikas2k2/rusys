import { act, fireEvent, renderHook } from '@testing-library/react';
import { mockLocalStorage } from '@tests/mockLocalStorage';

import { COLOR_SCHEME_KEY, ColorSchemeState } from '@ui/ColorScheme';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';

describe('useColorSchemeState', () => {
    const { getItem, setItem, removeItem } = mockLocalStorage();

    afterEach(() => jest.clearAllMocks());

    it('returns "auto" color scheme by default', () => {
        const { result } = renderHook(() => useColorSchemeState(), { wrapper: ColorSchemeState });

        expect(result.current[0]).toBe('auto');
    });

    it('returns "dark" color scheme from local storage', () => {
        getItem.mockReturnValueOnce('dark');
        const { result } = renderHook(() => useColorSchemeState(), { wrapper: ColorSchemeState });

        expect(result.current[0]).toBe('dark');
    });

    it('returns "light" after value changed on local storage', () => {
        const { result } = renderHook(() => useColorSchemeState(), { wrapper: ColorSchemeState });
        act(() => fireEvent(window, new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'light' })));

        expect(result.current[0]).toBe('light');
    });

    it('returns "auto" after value cleared on local storage', () => {
        const { result } = renderHook(() => useColorSchemeState(), { wrapper: ColorSchemeState });
        act(() => fireEvent(window, new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'light' })));
        act(() => fireEvent(window, new StorageEvent('storage', { key: null })));

        expect(result.current[0]).toBe('auto');
    });

    it('returns "dark" after value is explicitly set and local storage item is updated', () => {
        const { result } = renderHook(() => useColorSchemeState(), { wrapper: ColorSchemeState });
        act(() => result.current[1]('dark'));

        expect(result.current[0]).toBe('dark');
        expect(setItem).toHaveBeenCalledWith(COLOR_SCHEME_KEY, 'dark');
        expect(removeItem).not.toHaveBeenCalled();
    });

    it('returns "auto" after value is explicitly set and local storage item is removed', () => {
        const { result } = renderHook(() => useColorSchemeState(), { wrapper: ColorSchemeState });
        act(() => result.current[1]('dark'));
        act(() => result.current[1]('auto'));

        expect(result.current[0]).toBe('auto');
        expect(removeItem).toHaveBeenCalledWith(COLOR_SCHEME_KEY);
    });
});
